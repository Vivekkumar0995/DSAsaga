import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';
import crypto from 'crypto';
import mongoose from 'mongoose';

// -----------------------------------------------------------------------------
// MONGODB QUESTION FETCHING & ANTI-CHEAT DATA STRIPPING
// -----------------------------------------------------------------------------
const getQuestionModel = () => {
    if (mongoose.models.Question) {
        return mongoose.models.Question;
    }
    const questionSchema = new mongoose.Schema({
        data_structure_id: mongoose.Schema.Types.ObjectId,
        title: String,
        slug: String,
        difficulty: String,
        category: String,
        description: String,
        starter_code: Object,
        return_type: String,
        params: Array,
        test_cases: Array,
        order: Number,
        xp: Number,
        reference_solution: String,
        correctAnswer: String,
        time_limit_ms: Number,
        memory_limit_mb: Number,
        unordered_output: Boolean,
    }, { strict: false });
    return mongoose.model('Question', questionSchema);
};

const fetchMatchQuestions = async (difficulty = 'medium') => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (mongoUri && mongoose.connection.readyState !== 1) {
            await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        }
        const QuestionModel = getQuestionModel();
        const normDiff = (difficulty || 'medium').trim().toLowerCase();
        let questions = await QuestionModel.aggregate([
            { $match: { difficulty: { $regex: new RegExp(`^${normDiff}$`, 'i') } } },
            { $sample: { size: 1 } }
        ]);
        if (!questions || questions.length === 0) {
            questions = await QuestionModel.aggregate([{ $sample: { size: 1 } }]);
        }
        if (!questions || questions.length === 0) {
            questions = await QuestionModel.find().limit(1).lean();
        }
        return JSON.parse(JSON.stringify(questions || []));
    } catch (err) {
        console.error('[MongoDB Error] Failed to fetch match questions:', err.message);
        return [];
    }
};

/**
 * Anti-Cheat Helper: Strips sensitive fields (like correctAnswer, reference_solution)
 * from question objects before broadcasting to clients.
 */
const stripSensitiveQuestionData = (questions) => {
    if (!Array.isArray(questions)) return [];
    return questions.map((q) => {
        const safeQ = typeof q.toObject === 'function' ? q.toObject() : JSON.parse(JSON.stringify(q));
        delete safeQ.correctAnswer;
        delete safeQ.reference_solution;
        if (Array.isArray(safeQ.test_cases)) {
            safeQ.test_cases = safeQ.test_cases.map((tc) => {
                if (tc.is_hidden) {
                    const { output, ...hiddenTc } = tc;
                    return hiddenTc;
                }
                return tc;
            });
        }
        return safeQ;
    });
};


const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : dev
        ? ['http://localhost:3000']
        : ['https://dsasaga.in', 'https://www.dsasaga.in'];

// -----------------------------------------------------------------------------
// CONSTANTS & CONFIGURATION
// -----------------------------------------------------------------------------
const DISCONNECT_GRACE_PERIOD_MS = 60000; // 60 seconds (1 min) grace period for tab switch / refresh
const CONTEST_DURATION_MS = 5400000;       // 1.5 Hours default contest duration
const TIME_SYNC_INTERVAL_MS = 10000;       // Broadcast time sync every 10 seconds

const DIFFICULTY_DURATIONS_MS = {
    easy: 15 * 60 * 1000,    // 15 minutes (900,000 ms)
    medium: 30 * 60 * 1000,  // 30 minutes (1,800,000 ms)
    hard: 45 * 60 * 1000,    // 45 minutes (2,700,000 ms)
};

const getDurationForDifficulty = (difficulty) => {
    const norm = (difficulty || 'medium').trim().toLowerCase();
    return DIFFICULTY_DURATIONS_MS[norm] || DIFFICULTY_DURATIONS_MS.medium;
};

// -----------------------------------------------------------------------------
// IN-MEMORY DATA STORES
// -----------------------------------------------------------------------------
const queues = new Map();              // Map<topic, Map<userId, Socket>>
const activeMatches = new Map();       // Map<roomId, Match>
const connectedSockets = new Map();    // Map<userId, Socket> (Enforces single active connection per userId)
const customLobbies = new Map();       // Map<inviteCode, Lobby> (Pending custom rooms)

/**
 * Secure 6-Char Alphanumeric Invite Code Generator (Domain 2, Issue 4)
 * Reads character set dynamically from process.env.INVITE_CODE_CHARSET for security configuration.
 */
const generateSecureInviteCode = () => {
    const chars = process.env.INVITE_CODE_CHARSET || 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code;
    do {
        let randomStr = '';
        const bytes = crypto.randomBytes(6);
        for (let i = 0; i < 6; i++) {
            randomStr += chars[bytes[i] % chars.length];
        }
        code = `DSA-${randomStr}`;
    } while (customLobbies.has(code) || activeMatches.has(code));
    return code;
};

// -----------------------------------------------------------------------------
// RATE LIMITING (Zero Memory Leak Window Token Bucket)
// -----------------------------------------------------------------------------
const isRateLimited = (socket, limit = 10, windowMs = 10000) => {
    const now = Date.now();
    if (!socket.rateLimit || now > socket.rateLimit.resetTime) {
        socket.rateLimit = { count: 1, resetTime: now + windowMs };
        return false;
    }
    socket.rateLimit.count += 1;
    return socket.rateLimit.count > limit;
};

// -----------------------------------------------------------------------------
// HELPER: Calculate Match Outcome Authoritatively
// -----------------------------------------------------------------------------
/**
 * Prevent Race Condition #6 & #3:
 * Server computes winner based solely on server-tracked question states and timestamps.
 */
const determineMatchWinner = (match) => {
    const players = Array.from(match.players.values());
    if (players.length === 0) return { winnerUserId: null, reason: 'no_players', message: 'No players in match' };
    if (players.length === 1) {
        return {
            winnerUserId: players[0].userId,
            winnerName: players[0].username,
            reason: 'opponent_abandoned',
            message: 'Opponent disconnected or left match.'
        };
    }

    const p1 = players[0];
    const p2 = players[1];

    const p1Solved = p1.aggregateProgress.questionsSolved;
    const p2Solved = p2.aggregateProgress.questionsSolved;

    const p1Passes = p1.aggregateProgress.totalPassCount;
    const p2Passes = p2.aggregateProgress.totalPassCount;

    const p1Time = p1.aggregateProgress.timeTakenMs || (CONTEST_DURATION_MS + 1);
    const p2Time = p2.aggregateProgress.timeTakenMs || (CONTEST_DURATION_MS + 1);

    // Rule 1: Highest questions solved
    if (p1Solved > p2Solved) {
        return { winnerUserId: p1.userId, winnerName: p1.username, reason: 'time_expired_most_questions', message: `${p1.username} solved more questions!` };
    }
    if (p2Solved > p1Solved) {
        return { winnerUserId: p2.userId, winnerName: p2.username, reason: 'time_expired_most_questions', message: `${p2.username} solved more questions!` };
    }

    // Rule 2: Highest total test cases passed
    if (p1Passes > p2Passes) {
        return { winnerUserId: p1.userId, winnerName: p1.username, reason: 'time_expired_most_questions', message: `${p1.username} passed more test cases!` };
    }
    if (p2Passes > p1Passes) {
        return { winnerUserId: p2.userId, winnerName: p2.username, reason: 'time_expired_most_questions', message: `${p2.username} passed more test cases!` };
    }

    // Rule 3: Tie-breaker by lower completion time
    if (p1Time < p2Time) {
        return { winnerUserId: p1.userId, winnerName: p1.username, reason: 'time_expired_faster_time', message: `${p1.username} tied on questions but completed faster!` };
    }
    if (p2Time < p1Time) {
        return { winnerUserId: p2.userId, winnerName: p2.username, reason: 'time_expired_faster_time', message: `${p2.username} tied on questions but completed faster!` };
    }

    // Exact Tie
    return { winnerUserId: p1.userId, winnerName: 'Tie', reason: 'exact_tie', message: 'Match ended in an exact tie!' };
};

// -----------------------------------------------------------------------------
// HELPER: End Match & Cleanup Memory Leaks
// -----------------------------------------------------------------------------
const endMatch = (io, roomId, winnerInfo) => {
    const match = activeMatches.get(roomId);
    if (!match || match.status === 'ENDED') return;

    match.status = 'ENDED';

    // Clear server timer
    if (match.timerRef) {
        clearTimeout(match.timerRef);
        match.timerRef = null;
    }

    // Clear periodic time sync
    if (match.syncIntervalRef) {
        clearInterval(match.syncIntervalRef);
        match.syncIntervalRef = null;
    }

    // Clear all pending disconnect grace period timers
    for (const [userId, tracker] of match.disconnectTracker.entries()) {
        if (tracker.timerRef) clearTimeout(tracker.timerRef);
    }
    match.disconnectTracker.clear();

    console.log(`[Match Ended]: Room ${roomId}. Winner: ${winnerInfo.winnerName} (${winnerInfo.winnerUserId}). Reason: ${winnerInfo.reason}`);

    match.endedAt = Date.now();

    // Map internal reason to standardized categories ('forfeit' | 'timeout' | 'score')
    let stdReason = 'score';
    if (winnerInfo.reason === 'opponent_forfeit') {
        stdReason = 'forfeit';
    } else if (winnerInfo.reason === 'opponent_abandoned') {
        stdReason = 'timeout';
    }

    const standardizedPayload = {
        winnerId: winnerInfo.winnerUserId,
        winnerUserId: winnerInfo.winnerUserId,
        winnerName: winnerInfo.winnerName,
        reason: stdReason,
        rawReason: winnerInfo.reason,
        message: winnerInfo.message,
        finalScores: Array.from(match.players.values()).map(p => ({
            userId: p.userId,
            username: p.username,
            questionsSolved: p.aggregateProgress.questionsSolved,
            totalPassCount: p.aggregateProgress.totalPassCount,
            timeTakenMs: p.aggregateProgress.timeTakenMs
        }))
    };

    // Broadcast standardized final match outcome
    io.to(roomId).emit('matchEnded', standardizedPayload);
    io.to(roomId).emit('battleEnded', standardizedPayload);

    // Clean up memory after 15 seconds to allow late socket ACKs to complete
    setTimeout(() => {
        activeMatches.delete(roomId);
        console.log(`[Match Cleanup]: Memory cleared for room ${roomId}`);
    }, 15000);
};

// -----------------------------------------------------------------------------
// START SERVER & PERIODIC GARBAGE COLLECTOR (Domain 2, Issue 6)
// -----------------------------------------------------------------------------
app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(httpServer, {
        cors: {
            origin: ALLOWED_ORIGINS,
            methods: ['GET', 'POST'],
            credentials: true
        },
        maxHttpBufferSize: 1e5,
        pingTimeout: 10000,
        pingInterval: 10000,
    });

    // Domain 2, Issue 6: 30s Periodic GC for stale custom lobbies (>10m) and ended matches (>1m)
    setInterval(() => {
        const now = Date.now();
        for (const [code, lobby] of customLobbies.entries()) {
            if (now - lobby.createdAt > 600000) {
                customLobbies.delete(code);
                console.log(`[GC]: Destroyed stale custom lobby ${code}`);
            }
        }
        for (const [roomId, match] of activeMatches.entries()) {
            if (match.status === 'ENDED' && match.endedAt && now - match.endedAt > 60000) {
                activeMatches.delete(roomId);
                console.log(`[GC]: Cleared ended match memory for room ${roomId}`);
            }
        }
    }, 30000);

    // -------------------------------------------------------------------------
    // SOCKET AUTHENTICATION MIDDLEWARE
    // Prevent Issue #1 (Username Collisions):
    // Require or generate an immutable, unique userId. Store username for display only.
    // -------------------------------------------------------------------------
    io.use((socket, nextAuth) => {
        const authHeader = socket.handshake.auth || socket.handshake.headers;
        const rawUsername = authHeader?.username || 'Player';
        let userId = authHeader?.userId;

        // Auto-assign unique immutable userId if client does not provide one
        if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
            userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
        }

        const sanitizedUsername = String(rawUsername)
            .replace(/[^a-zA-Z0-9_-]/g, '')
            .substring(0, 30)
            .trim() || 'Player';

        socket.userData = {
            userId,
            username: sanitizedUsername
        };

        nextAuth();
    });

    // -------------------------------------------------------------------------
    // SOCKET CONNECTION HANDLER
    // -------------------------------------------------------------------------
    io.on('connection', (socket) => {
        const { userId, username } = socket.userData;
        console.log(`[Socket Authenticated]: Socket ${socket.id} -> User ${userId} ("${username}")`);

        // Prevent Duplicate Sessions: Disconnect older socket connection for same userId
        if (connectedSockets.has(userId)) {
            const oldSocket = connectedSockets.get(userId);
            if (oldSocket.id !== socket.id) {
                console.log(`[Session Override]: Disconnecting older socket ${oldSocket.id} for userId ${userId}`);
                oldSocket.emit('sessionOverridden', { message: 'Signed in from another window or connection.' });
                oldSocket.disconnect(true);
            }
        }
        connectedSockets.set(userId, socket);

        // Helper: Remove user from matchmaking queues
        const removeFromQueues = (uId) => {
            for (const [topic, queueMap] of queues.entries()) {
                if (queueMap.has(uId)) {
                    queueMap.delete(uId);
                    if (queueMap.size === 0) queues.delete(topic);
                    console.log(`[Queue Left]: User ${uId} left queue ${topic}`);
                }
            }
        };

        // ---------------------------------------------------------------------
        // 1v1 MATCHMAKING QUEUE (Domain 1: Multi-Tab, Double-Queue, Ghost Sockets)
        // ---------------------------------------------------------------------
        socket.on('joinQueue', async ({ topic, difficulty }) => {
            if (isRateLimited(socket)) return;
            if (!topic || typeof topic !== 'string' || topic.length > 50) return;

            const sanitizedTopic = topic.trim().toLowerCase();
            const sanitizedDifficulty = (difficulty || 'medium').trim().toLowerCase();
            const queueKey = `${sanitizedTopic}_${sanitizedDifficulty}`;

            removeFromQueues(userId); // Double-Queueing Guard (Issue 2)

            if (!queues.has(queueKey)) {
                queues.set(queueKey, new Map());
            }

            const currentQueue = queues.get(queueKey);
            currentQueue.set(userId, socket); // Keyed by userId (Issue 1)

            console.log(`[Queue Join]: User "${username}" (${userId}) joined ${queueKey}. Queue size: ${currentQueue.size}`);

            // Filter active connected sockets (Issue 3: Ghost Sockets Filter)
            const activeQueueEntries = Array.from(currentQueue.entries()).filter(([_, sock]) => sock && sock.connected && !sock.disconnected);

            if (activeQueueEntries.length >= 2) {
                const [entry1, entry2] = activeQueueEntries.slice(0, 2);
                const [userId1, p1Socket] = entry1;
                const [userId2, p2Socket] = entry2;

                // Multi-Tab Abuse Guard (Issue 1)
                if (userId1 === userId2) {
                    console.log(`[Multi-Tab Guard]: User ${userId1} attempted self-matching. Dropping duplicate.`);
                    currentQueue.delete(userId1);
                    return;
                }

                currentQueue.delete(userId1);
                currentQueue.delete(userId2);

                const roomId = `match_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
                p1Socket.join(roomId);
                p2Socket.join(roomId);

                p1Socket.currentRoom = roomId;
                p2Socket.currentRoom = roomId;

                const durationMs = getDurationForDifficulty(sanitizedDifficulty);
                const startTime = Date.now();
                const endTime = startTime + durationMs;

                // Server-Authoritative Question Fetching & Anti-Cheat Stripping
                const rawQuestions = await fetchMatchQuestions(sanitizedDifficulty);
                const safeQuestions = stripSensitiveQuestionData(rawQuestions);

                // Create Authoritative Match State
                const newMatch = {
                    roomId,
                    status: 'ACTIVE',
                    topic: sanitizedTopic,
                    difficulty: sanitizedDifficulty,
                    contestStartTime: startTime,
                    contestEndTime: endTime,
                    endTime: endTime,
                    durationMs: durationMs,
                    originalQuestions: rawQuestions,
                    safeQuestions: safeQuestions,
                    players: new Map([
                        [userId1, {
                            userId: userId1,
                            username: p1Socket.userData.username,
                            socketId: p1Socket.id,
                            connected: true,
                            lastSeen: Date.now(),
                            questionStates: new Map(), // Map<questionId, QuestionState>
                            aggregateProgress: { questionsSolved: 0, totalPassCount: 0, timeTakenMs: 0 }
                        }],
                        [userId2, {
                            userId: userId2,
                            username: p2Socket.userData.username,
                            socketId: p2Socket.id,
                            connected: true,
                            lastSeen: Date.now(),
                            questionStates: new Map(),
                            aggregateProgress: { questionsSolved: 0, totalPassCount: 0, timeTakenMs: 0 }
                        }]
                    ]),
                    processedSubmissions: new Set(), // Idempotency cache for submission IDs
                    pendingSubmissions: new Map(),   // Transactional submissions in-flight
                    disconnectTracker: new Map(),    // Grace period timers
                    timerRef: null,
                    syncIntervalRef: null
                };

                // Server-Authoritative Contest Expiration Timer (Issue 8)
                newMatch.timerRef = setTimeout(() => {
                    const winner = determineMatchWinner(newMatch);
                    endMatch(io, roomId, winner);
                }, durationMs);

                // Periodic Server Time Sync (Issue 8)
                newMatch.syncIntervalRef = setInterval(() => {
                    if (newMatch.status !== 'ACTIVE') return;
                    io.to(roomId).emit('timeSync', {
                        serverTime: Date.now(),
                        contestStartTime: newMatch.contestStartTime,
                        contestEndTime: newMatch.contestEndTime,
                        remainingMs: Math.max(0, newMatch.contestEndTime - Date.now())
                    });
                }, TIME_SYNC_INTERVAL_MS);

                activeMatches.set(roomId, newMatch);

                console.log(`[Battle Created]: Room ${roomId} between User ${userId1} and User ${userId2}`);

                io.to(roomId).emit('battleStart', {
                    roomId,
                    topic: sanitizedTopic,
                    contestStartTime: startTime,
                    contestEndTime: endTime,
                    endTime: endTime,
                    questions: safeQuestions,
                    players: [
                        { userId: userId1, username: p1Socket.userData.username },
                        { userId: userId2, username: p2Socket.userData.username }
                    ]
                });
            }
        });

        socket.on('leaveQueue', () => {
            removeFromQueues(userId);
        });

        // ---------------------------------------------------------------------
        // CUSTOM ROOM CREATION & JOINING (Domain 2: Issues 4, 5, 7)
        // ---------------------------------------------------------------------
        socket.on('createCustomRoom', ({ topic }) => {
            if (isRateLimited(socket)) return;
            removeFromQueues(userId);

            const inviteCode = generateSecureInviteCode(); // Domain 2, Issue 4: Secure 6-Char Generator

            customLobbies.set(inviteCode, {
                inviteCode,
                hostUserId: userId,
                hostSocketId: socket.id,
                topic: (topic || 'general').trim().toLowerCase(),
                createdAt: Date.now()
            });

            socket.currentRoom = inviteCode;
            socket.customTopic = (topic || 'general').trim().toLowerCase();
            socket.join(inviteCode);

            console.log(`[Custom Lobby Created]: Code ${inviteCode} by Host ${userId} ("${username}")`);
            socket.emit('customRoomCreated', { inviteCode, topic: socket.customTopic });
        });

        socket.on('joinCustomRoom', async ({ inviteCode }) => {
            if (isRateLimited(socket)) return;

            if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.startsWith('DSA-')) {
                return socket.emit('battleError', 'Invalid invite code format.');
            }

            const cleanCode = inviteCode.trim().toUpperCase();
            const lobby = customLobbies.get(cleanCode);

            if (!lobby) {
                return socket.emit('battleError', 'Room does not exist or has expired.');
            }

            const room = io.sockets.adapter.rooms.get(cleanCode);

            // Domain 2, Issue 7: Strict 3+ Player Overflow Guard
            if (!room || room.size >= 2 || activeMatches.has(cleanCode)) {
                return socket.emit('battleError', 'Room is full or match is already in progress.');
            }

            // Remove lobby from pending store as guest is joining
            customLobbies.delete(cleanCode);

            removeFromQueues(userId);
            socket.currentRoom = cleanCode;
            socket.join(cleanCode);

            const roomSocketIds = Array.from(room);
            const p1Socket = io.sockets.sockets.get(roomSocketIds[0]);
            const p2Socket = socket;

            if (!p1Socket || !p1Socket.connected) {
                return socket.emit('battleError', 'Host disconnected before match could start.');
            }

            const topic = lobby.topic || p1Socket?.customTopic || 'general';
            const startTime = Date.now();
            const endTime = startTime + CONTEST_DURATION_MS;

            // Server-Authoritative Question Fetching & Anti-Cheat Stripping
            const rawQuestions = await fetchMatchQuestions();
            const safeQuestions = stripSensitiveQuestionData(rawQuestions);

            const newMatch = {
                roomId: cleanCode,
                status: 'ACTIVE',
                topic,
                contestStartTime: startTime,
                contestEndTime: endTime,
                endTime: endTime,
                durationMs: CONTEST_DURATION_MS,
                originalQuestions: rawQuestions,
                safeQuestions: safeQuestions,
                players: new Map([
                    [p1Socket.userData.userId, {
                        userId: p1Socket.userData.userId,
                        username: p1Socket.userData.username,
                        socketId: p1Socket.id,
                        connected: true,
                        lastSeen: Date.now(),
                        questionStates: new Map(),
                        aggregateProgress: { questionsSolved: 0, totalPassCount: 0, timeTakenMs: 0 }
                    }],
                    [p2Socket.userData.userId, {
                        userId: p2Socket.userData.userId,
                        username: p2Socket.userData.username,
                        socketId: p2Socket.id,
                        connected: true,
                        lastSeen: Date.now(),
                        questionStates: new Map(),
                        aggregateProgress: { questionsSolved: 0, totalPassCount: 0, timeTakenMs: 0 }
                    }]
                ]),
                processedSubmissions: new Set(),
                pendingSubmissions: new Map(),
                disconnectTracker: new Map(),
                timerRef: null,
                syncIntervalRef: null
            };

            newMatch.timerRef = setTimeout(() => {
                const winner = determineMatchWinner(newMatch);
                endMatch(io, cleanCode, winner);
            }, CONTEST_DURATION_MS);

            newMatch.syncIntervalRef = setInterval(() => {
                if (newMatch.status !== 'ACTIVE') return;
                io.to(cleanCode).emit('timeSync', {
                    serverTime: Date.now(),
                    contestStartTime: newMatch.contestStartTime,
                    contestEndTime: newMatch.contestEndTime,
                    remainingMs: Math.max(0, newMatch.contestEndTime - Date.now())
                });
            }, TIME_SYNC_INTERVAL_MS);

            activeMatches.set(cleanCode, newMatch);

            console.log(`[Custom Battle Started]: Room ${cleanCode} between Host ${p1Socket.userData.userId} and Guest ${p2Socket.userData.userId}`);

            io.to(cleanCode).emit('battleStart', {
                roomId: cleanCode,
                isCustom: true,
                topic,
                contestStartTime: startTime,
                contestEndTime: endTime,
                endTime: endTime,
                questions: safeQuestions,
                players: [
                    { userId: p1Socket.userData.userId, username: p1Socket.userData.username },
                    { userId: p2Socket.userData.userId, username: p2Socket.userData.username }
                ]
            });
        });

        // ---------------------------------------------------------------------
        // RECONNECTION & SESSION RESTORATION (Prevents Issue #2)
        // ---------------------------------------------------------------------
        socket.on('joinBattleRoom', ({ roomId }) => {
            if (!roomId || typeof roomId !== 'string') {
                return socket.emit('invalidRoom', { message: 'Invalid room ID provided.' });
            }

            const match = activeMatches.get(roomId);
            if (!match || match.status === 'ENDED') {
                return socket.emit('invalidRoom', { message: 'Room does not exist or has expired.' });
            }

            const player = match.players.get(userId);
            if (!player) {
                return socket.emit('roomUnauthorized', { message: 'You are not an authorized participant in this battle.' });
            }

            // Cancel active disconnect grace period timer if user reconnected
            if (match.disconnectTracker.has(userId)) {
                const tracker = match.disconnectTracker.get(userId);
                if (tracker.timerRef) clearTimeout(tracker.timerRef);
                match.disconnectTracker.delete(userId);
                console.log(`[Disconnect Restored]: User ${userId} ("${username}") reconnected within grace period.`);
            }

            player.connected = true;
            player.socketId = socket.id;
            player.lastSeen = Date.now();
            socket.currentRoom = roomId;
            socket.join(roomId);

            // Notify opponent of reconnection
            socket.to(roomId).emit('opponentReconnected', {
                userId,
                username,
                message: `${username} has reconnected!`
            });

            // Send complete state restoration payload to reconnected client
            socket.emit('battleStateRestore', {
                roomId: match.roomId,
                status: match.status,
                contestStartTime: match.contestStartTime,
                contestEndTime: match.contestEndTime,
                endTime: match.endTime || match.contestEndTime,
                remainingMs: Math.max(0, (match.endTime || match.contestEndTime) - Date.now()),
                serverTime: Date.now(),
                questions: match.safeQuestions || stripSensitiveQuestionData(match.originalQuestions),
                myProgress: {
                    questionsSolved: player.aggregateProgress.questionsSolved,
                    totalPassCount: player.aggregateProgress.totalPassCount,
                    questionStates: Array.from(player.questionStates.entries()).map(([qId, qState]) => ({
                        questionId: qId,
                        ...qState
                    }))
                },
                players: Array.from(match.players.values()).map(p => ({
                    userId: p.userId,
                    username: p.username,
                    connected: p.connected,
                    questionsSolved: p.aggregateProgress.questionsSolved,
                    totalPassCount: p.aggregateProgress.totalPassCount
                }))
            });
        });

        // ---------------------------------------------------------------------
        // CONTINUOUS AUTO-SAVE & STATE TRACKING (Prevents Issue #3)
        // Tracks question states (UNSOLVED, ATTEMPTED, SOLVED, SUBMITTED) independently
        // from final submit button clicks.
        // ---------------------------------------------------------------------
        socket.on('autoSaveProgress', ({ roomId, questionId, passCount, totalTests, code }) => {
            if (isRateLimited(socket, 30, 5000)) return;
            if (!roomId || !questionId) return;

            const match = activeMatches.get(roomId);
            if (!match || match.status !== 'ACTIVE') return;

            const player = match.players.get(userId);
            if (!player) return;

            const safePassCount = Math.max(0, Math.min(passCount || 0, totalTests || 5));
            const total = totalTests || 5;

            let currentState = player.questionStates.get(questionId);
            if (!currentState) {
                currentState = { status: 'UNSOLVED', passCount: 0, totalTests: total, code: '' };
            }

            // Determine status based on test execution
            let newStatus = currentState.status;
            if (currentState.status !== 'SUBMITTED') {
                if (safePassCount === total) {
                    newStatus = 'SOLVED';
                } else if (safePassCount > 0) {
                    newStatus = 'ATTEMPTED';
                }
            }

            // Update per-question state map
            player.questionStates.set(questionId, {
                status: newStatus,
                passCount: Math.max(currentState.passCount, safePassCount),
                totalTests: total,
                code: code || currentState.code,
                lastUpdated: Date.now()
            });

            // Re-calculate aggregate progress authoritatively from question states
            let solvedCount = 0;
            let sumPasses = 0;

            for (const qState of player.questionStates.values()) {
                if (qState.status === 'SOLVED' || qState.status === 'SUBMITTED') {
                    solvedCount += 1;
                }
                sumPasses += qState.passCount;
            }

            const prevSolved = player.aggregateProgress.questionsSolved;
            const prevPasses = player.aggregateProgress.totalPassCount;

            player.aggregateProgress.questionsSolved = solvedCount;
            player.aggregateProgress.totalPassCount = sumPasses;
            player.aggregateProgress.timeTakenMs = Date.now() - match.contestStartTime;

            // Prevent Issue #5 (Opponent UI Flickering): Diffing check before emitting progress broadcast
            if (prevSolved !== solvedCount || prevPasses !== sumPasses) {
                socket.to(roomId).emit('opponentProgress', {
                    userId,
                    username,
                    questionsSolved: solvedCount,
                    totalPassCount: sumPasses,
                    totalQuestions: 4,
                    isCompleted: solvedCount >= 4
                });
            }
        });

        // ---------------------------------------------------------------------
        // TRANSACTIONAL 6-STAGE SUBMISSION FLOW (Prevents Issue #4 & #5)
        // States: RECEIVED -> QUEUED -> PROCESSING -> VERIFIED -> PERSISTED -> FINALIZED
        // Incorporates idempotency check via unique submissionId.
        // ---------------------------------------------------------------------
        socket.on('submitCode', async ({ roomId, submissionId, questionId, passCount, totalTests, code }) => {
            if (isRateLimited(socket, 15, 5000)) return;

            // Validate submission payload & submissionId
            if (!roomId || !submissionId || !questionId) {
                return socket.emit('submissionFailed', { submissionId, error: 'Invalid submission parameters.' });
            }

            const match = activeMatches.get(roomId);
            if (!match || match.status !== 'ACTIVE') {
                return socket.emit('submissionFailed', { submissionId, error: 'Match is no longer active.' });
            }

            const player = match.players.get(userId);
            if (!player) {
                return socket.emit('submissionFailed', { submissionId, error: 'Player not found in match.' });
            }

            // Deduplication Check (Issue #5): Ignore already processed or in-flight submission ID
            if (match.processedSubmissions.has(submissionId) || match.pendingSubmissions.has(submissionId)) {
                console.log(`[Deduplication]: Duplicate submission ${submissionId} from user ${userId} dropped.`);
                return socket.emit('submissionAck', { submissionId, stage: 'FINALIZED', duplicate: true });
            }

            try {
                // STAGE 1: RECEIVED
                match.pendingSubmissions.set(submissionId, {
                    submissionId,
                    userId,
                    questionId,
                    stage: 'RECEIVED',
                    timestamp: Date.now()
                });
                socket.emit('submissionAck', { submissionId, stage: 'RECEIVED' });

                // STAGE 2: QUEUED
                match.pendingSubmissions.get(submissionId).stage = 'QUEUED';
                socket.emit('submissionAck', { submissionId, stage: 'QUEUED' });

                // STAGE 3: PROCESSING
                match.pendingSubmissions.get(submissionId).stage = 'PROCESSING';
                socket.emit('submissionAck', { submissionId, stage: 'PROCESSING' });

                // STAGE 4: VERIFIED
                const safePassCount = Math.max(0, Math.min(passCount || 0, totalTests || 5));
                const total = totalTests || 5;
                const isAccepted = safePassCount === total;

                match.pendingSubmissions.get(submissionId).stage = 'VERIFIED';
                socket.emit('submissionAck', { submissionId, stage: 'VERIFIED', isAccepted });

                // STAGE 5: PERSISTED (Atomic Write to Server Memory State)
                player.questionStates.set(questionId, {
                    status: isAccepted ? 'SUBMITTED' : 'ATTEMPTED',
                    passCount: safePassCount,
                    totalTests: total,
                    code: code || '',
                    lastUpdated: Date.now()
                });

                // Re-calculate aggregate metrics
                let solvedCount = 0;
                let sumPasses = 0;
                for (const qState of player.questionStates.values()) {
                    if (qState.status === 'SOLVED' || qState.status === 'SUBMITTED') {
                        solvedCount += 1;
                    }
                    sumPasses += qState.passCount;
                }

                player.aggregateProgress.questionsSolved = solvedCount;
                player.aggregateProgress.totalPassCount = sumPasses;
                player.aggregateProgress.timeTakenMs = Date.now() - match.contestStartTime;

                match.pendingSubmissions.get(submissionId).stage = 'PERSISTED';
                socket.emit('submissionAck', { submissionId, stage: 'PERSISTED' });

                // STAGE 6: FINALIZED
                match.processedSubmissions.add(submissionId);
                match.pendingSubmissions.delete(submissionId);

                // Send final ACK to client so client UI can safely display "Accepted"
                socket.emit('submissionAck', {
                    submissionId,
                    stage: 'FINALIZED',
                    isAccepted,
                    questionsSolved: solvedCount,
                    totalPassCount: sumPasses
                });

                // Broadcast opponent progress update diff
                socket.to(roomId).emit('opponentProgress', {
                    userId,
                    username,
                    questionsSolved: solvedCount,
                    totalPassCount: sumPasses,
                    totalQuestions: 4,
                    isCompleted: solvedCount >= 4
                });

                // Check immediate victory condition (Rule: single question race completion)
                if (solvedCount >= 1 && isAccepted) {
                    endMatch(io, roomId, {
                        winnerUserId: userId,
                        winnerName: username,
                        reason: 'completed',
                        message: `${username} solved the question first!`
                    });
                }

            } catch (err) {
                console.error(`[Submission Error]: Error processing submission ${submissionId}:`, err);
                match.pendingSubmissions.delete(submissionId);
                socket.emit('submissionFailed', {
                    submissionId,
                    error: 'Server transaction error during submission persistence. Please retry.'
                });
            }
        });

        // ---------------------------------------------------------------------
        // THE "DONE" BUTTON & ATOMIC WINS EVALUATION
        // ---------------------------------------------------------------------
        socket.on('submitSolution', async ({ roomId, questionId, code, language, passCount, totalTests }) => {
            if (isRateLimited(socket, 15, 5000)) return;

            if (!roomId) {
                return socket.emit('submissionFailed', { message: 'Invalid room ID provided.' });
            }

            const match = activeMatches.get(roomId);
            if (!match || match.status !== 'ACTIVE') {
                return socket.emit('submissionFailed', { message: 'Match is no longer active.' });
            }

            const player = match.players.get(userId);
            if (!player) {
                return socket.emit('submissionFailed', { message: 'Player not found in match.' });
            }

            const rawQuestion = (match.originalQuestions || []).find(q => String(q._id) === String(questionId) || q.slug === questionId) || match.originalQuestions[0];

            let isCorrect = false;

            // 1. Check correctAnswer field if defined on MongoDB question document
            if (rawQuestion?.correctAnswer && typeof rawQuestion.correctAnswer === 'string') {
                const cleanUserAnswer = (code || '').trim();
                const cleanCorrectAnswer = rawQuestion.correctAnswer.trim();
                if (cleanUserAnswer === cleanCorrectAnswer) {
                    isCorrect = true;
                }
            }

            // 2. Check test case execution (if passCount equals totalTests > 0)
            if (!isCorrect && passCount !== undefined && totalTests !== undefined && totalTests > 0 && passCount === totalTests) {
                isCorrect = true;
            }

            // 3. Fallback: if passCount > 0 and no correctAnswer field exists
            if (!isCorrect && !rawQuestion?.correctAnswer && passCount !== undefined && passCount > 0 && passCount >= (totalTests || 1)) {
                isCorrect = true;
            }

            if (!isCorrect) {
                console.log(`[SubmitSolution Failed]: User ${userId} ("${username}") submitted incomplete/incorrect solution for room ${roomId}`);
                return socket.emit('submissionFailed', {
                    message: "Incomplete! Please complete your question first."
                });
            }

            // Correct Solution: Atomically end match
            if (match.status !== 'ACTIVE') return;
            console.log(`[SubmitSolution Victory]: User ${userId} ("${username}") solved the question first in room ${roomId}!`);

            endMatch(io, roomId, {
                winnerUserId: userId,
                winnerName: username,
                reason: 'completed',
                message: `🏆 ${username} completed the question first!`
            });
        });

        // ---------------------------------------------------------------------
        // DISCONNECT & PAGEHIDE HANDLER (Grace Period Implementation)
        // ---------------------------------------------------------------------
        const handleDisconnection = () => {
            console.log(`[Socket Disconnected]: Socket ${socket.id} for user ${userId}`);
            connectedSockets.delete(userId);
            removeFromQueues(userId);

            // Domain 2, Issue 5: Cleanup pending custom lobby if host disconnects before guest joins
            for (const [code, lobby] of customLobbies.entries()) {
                if (lobby.hostUserId === userId) {
                    customLobbies.delete(code);
                    io.to(code).emit('battleError', 'Host left the custom room.');
                    console.log(`[Host Abandonment]: Destroyed lobby ${code} because host ${userId} left.`);
                }
            }

            const roomId = socket.currentRoom;
            if (!roomId) return;

            const match = activeMatches.get(roomId);
            if (!match || match.status !== 'ACTIVE') return;

            const player = match.players.get(userId);
            if (!player || player.explicitForfeit) return;

            player.connected = false;
            player.lastSeen = Date.now();

            // Domain 3, Issue 9: Double Disconnect Abort Check
            const allDisconnected = Array.from(match.players.values()).every(p => !p.connected);
            if (allDisconnected) {
                console.log(`[Double Disconnect]: Both players disconnected in room ${roomId}. Aborting match.`);
                endMatch(io, roomId, {
                    winnerUserId: null,
                    winnerName: 'Tie',
                    reason: 'double_disconnect',
                    message: 'Match aborted as both players lost connection.'
                });
                return;
            }

            if (match.disconnectTracker.has(userId)) return;

            console.log(`[Grace Period Started]: User ${userId} ("${username}") disconnected from room ${roomId}. Starting 30s timer.`);

            // Notify opponent that user is temporarily disconnected/reconnecting
            socket.to(roomId).emit('opponentReconnecting', {
                userId,
                username,
                gracePeriodSeconds: DISCONNECT_GRACE_PERIOD_MS / 1000,
                message: `${username} lost connection. Reconnect grace period active (30s)...`
            });

            // Set Server Grace Period Timer (30s)
            const timerRef = setTimeout(() => {
                console.log(`[Grace Period Expired]: User ${userId} ("${username}") failed to reconnect within 30s.`);

                // Find remaining connected opponent if any
                const remainingPlayers = Array.from(match.players.values()).filter(p => p.userId !== userId);
                let winnerUserId = null;
                let winnerName = 'Opponent';

                if (remainingPlayers.length > 0) {
                    winnerUserId = remainingPlayers[0].userId;
                    winnerName = remainingPlayers[0].username;
                }

                endMatch(io, roomId, {
                    winnerUserId,
                    winnerName,
                    reason: 'opponent_abandoned',
                    message: `${username} failed to reconnect within 30s grace period. ${winnerName} wins by forfeit!`
                });
            }, DISCONNECT_GRACE_PERIOD_MS);

            match.disconnectTracker.set(userId, {
                timerRef,
                disconnectedAt: Date.now()
            });
        };

        // Track 1: Explicit Forfeit Handler (Instant Win)
        socket.on('leaveMatch', ({ roomId } = {}) => {
            const targetRoomId = roomId || socket.currentRoom;
            if (!targetRoomId) return;

            const match = activeMatches.get(targetRoomId);
            if (match && match.status === 'ACTIVE') {
                const player = match.players.get(userId);
                if (player) {
                    player.explicitForfeit = true;
                }

                // Clear any pending disconnect timers for this match
                for (const [uId, tracker] of match.disconnectTracker.entries()) {
                    if (tracker.timerRef) clearTimeout(tracker.timerRef);
                }
                match.disconnectTracker.clear();

                const remaining = Array.from(match.players.values()).filter(p => p.userId !== userId);
                const winnerUserId = remaining.length > 0 ? remaining[0].userId : null;
                const winnerName = remaining.length > 0 ? remaining[0].username : 'Opponent';

                console.log(`[Explicit Forfeit]: User ${userId} ("${username}") forfeited match in room ${targetRoomId}.`);

                endMatch(io, targetRoomId, {
                    winnerUserId,
                    winnerName,
                    reason: 'opponent_forfeit',
                    message: `${username} surrendered/left the match. ${winnerName} wins by forfeit!`
                });
            }
        });

        // Event for browser pagehide signal (handled via disconnection grace period)
        socket.on('pagehide', () => {
            handleDisconnection();
        });

        // Native socket disconnection (Network Hiccup / Page Refresh)
        socket.on('disconnect', () => {
            handleDisconnection();
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Battle Arena Server running on http://localhost:${port}`);
    });
});

