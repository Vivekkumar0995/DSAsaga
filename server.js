import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : dev
        ? ['http://localhost:3000']
        : ['https://dsasaga.in', 'https://www.dsasaga.in'];

// Zero-memory-leak socket rate limiter
const isRateLimited = (socket, limit = 10, windowMs = 10000) => {
    const now = Date.now();
    if (!socket.rateLimit || now > socket.rateLimit.resetTime) {
        socket.rateLimit = { count: 1, resetTime: now + windowMs };
        return false;
    }

    socket.rateLimit.count += 1;
    return socket.rateLimit.count > limit;
};

const queues = {};
const activeMatches = new Map();

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

    // Socket Auth Middleware
    io.use((socket, nextAuth) => {
        const authHeader = socket.handshake.auth || socket.handshake.headers;
        const username = authHeader?.username;

        if (!username || typeof username !== 'string' || username.length > 50) {
            return nextAuth(new Error('Authentication failed: Invalid username'));
        }

        socket.userData = {
            userId: socket.handshake.auth?.userId || socket.id,
            username: username.replace(/[^a-zA-Z0-9_-]/g, '').trim() || 'Player'
        };

        nextAuth();
    });

    io.on('connection', (socket) => {
        console.log(`[Socket Authenticated]: ${socket.id} (${socket.userData.username})`);

        // O(1) Queue Removal
        const removeFromQueues = (sock) => {
            if (sock.currentTopic && queues[sock.currentTopic]) {
                queues[sock.currentTopic].delete(sock);
                delete sock.currentTopic;
            }
        };

        // 1v1 Random Matchmaking
        socket.on('joinQueue', ({ topic }) => {
            if (isRateLimited(socket)) return;
            if (!topic || typeof topic !== 'string' || topic.length > 50) return;
            const sanitizedTopic = topic.trim().toLowerCase();

            removeFromQueues(socket);

            if (!queues[sanitizedTopic]) {
                queues[sanitizedTopic] = new Set();
            }

            queues[sanitizedTopic].add(socket);
            socket.currentTopic = sanitizedTopic;

            console.log(`Player ${socket.userData.username} joined queue for ${sanitizedTopic}`);

            // Filter out any stale/disconnected sockets before pairing
            const currentQueue = Array.from(queues[sanitizedTopic]).filter(s => s.connected);

            if (currentQueue.length >= 2) {
                const p1 = currentQueue[0];
                const p2 = currentQueue[1];

                queues[sanitizedTopic].delete(p1);
                queues[sanitizedTopic].delete(p2);
                delete p1.currentTopic;
                delete p2.currentTopic;

                const roomId = `match_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                p1.join(roomId);
                p2.join(roomId);
                p1.currentRoom = roomId;
                p2.currentRoom = roomId;

                activeMatches.set(roomId, {
                    roomId,
                    state: 'ACTIVE',
                    topic: sanitizedTopic,
                    startTime: Date.now(),
                    players: new Map([
                        [p1.userData.username, { username: p1.userData.username, socketId: p1.id }],
                        [p2.userData.username, { username: p2.userData.username, socketId: p2.id }]
                    ]),
                    playerProgress: new Map()
                });

                io.to(roomId).emit('battleStart', {
                    roomId,
                    topic: sanitizedTopic,
                    players: [
                        { id: p1.id, name: p1.userData.username },
                        { id: p2.id, name: p2.userData.username }
                    ]
                });
            }
        });

        socket.on('leaveQueue', ({ topic }) => {
            if (!topic || typeof topic !== 'string') return;
            removeFromQueues(socket);
        });

        // Create Custom Invite Room
        socket.on('createCustomRoom', ({ topic }) => {
            if (isRateLimited(socket)) return;
            if (!topic || typeof topic !== 'string') return;

            removeFromQueues(socket);

            // Collision-proof invite code generation
            let inviteCode;
            do {
                inviteCode = `DSA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            } while (io.sockets.adapter.rooms.has(inviteCode));

            socket.currentRoom = inviteCode;
            socket.customTopic = topic.trim().toLowerCase();
            socket.join(inviteCode);

            socket.emit('customRoomCreated', { inviteCode, topic: socket.customTopic });
        });

        // Join Custom Invite Room
        socket.on('joinCustomRoom', ({ inviteCode }) => {
            if (isRateLimited(socket)) return;

            if (!inviteCode || typeof inviteCode !== 'string' || !inviteCode.startsWith('DSA-')) {
                return socket.emit('battleError', 'Invalid invite code format.');
            }

            const cleanCode = inviteCode.trim().toUpperCase();
            const room = io.sockets.adapter.rooms.get(cleanCode);

            if (!room) {
                return socket.emit('battleError', 'Room does not exist or has expired.');
            }

            if (room.size >= 2) {
                return socket.emit('battleError', 'Room is full.');
            }

            removeFromQueues(socket);
            socket.currentRoom = cleanCode;
            socket.join(cleanCode);

            const roomSockets = Array.from(room);
            const hostSocket = io.sockets.sockets.get(roomSockets[0]);
            const topic = hostSocket?.customTopic || 'general';

            activeMatches.set(cleanCode, {
                roomId: cleanCode,
                state: 'ACTIVE',
                topic,
                startTime: Date.now(),
                players: new Map(roomSockets.map(id => {
                    const uName = io.sockets.sockets.get(id)?.userData?.username || 'Player';
                    return [uName, { username: uName, socketId: id }];
                })),
                playerProgress: new Map()
            });

            io.to(cleanCode).emit('battleStart', {
                roomId: cleanCode,
                isCustom: true,
                topic,
                players: roomSockets.map(id => ({
                    id,
                    name: io.sockets.sockets.get(id)?.userData?.username || 'Player'
                }))
            });
        });

        // Progress Tracking & Real-time Submission Updates
        socket.on('submitAttempt', ({ roomId, passCount, totalTests, questionsSolved = 0, totalQuestions = 4, isCompleted, timeTakenMs }) => {
            if (isRateLimited(socket, 20, 5000)) return;
            if (typeof roomId !== 'string') return;

            const match = activeMatches.get(roomId);
            if (!match || !match.players.has(socket.userData.username) || match.state !== 'ACTIVE') {
                return;
            }

            const safePassCount = Math.max(0, Math.min(passCount || 0, totalTests || 5));
            const safeQuestionsSolved = Math.max(0, Math.min(questionsSolved || 0, totalQuestions));
            const elapsedTime = timeTakenMs || (Date.now() - (match.startTime || Date.now()));

            match.playerProgress.set(socket.id, {
                passCount: safePassCount,
                totalTests: totalTests || 5,
                questionsSolved: safeQuestionsSolved,
                totalQuestions,
                timeTakenMs: elapsedTime,
                name: socket.userData.username
            });

            // Broadcast real-time progress to opponent
            socket.to(roomId).emit('opponentProgress', {
                senderId: socket.id,
                passCount: safePassCount,
                totalTests: totalTests || 5,
                questionsSolved: safeQuestionsSolved,
                totalQuestions,
                isCompleted: isCompleted || (safeQuestionsSolved >= totalQuestions),
                name: socket.userData.username
            });

            // Rule 2: If a player completed all 4 questions, declare immediate winner
            if (isCompleted || safeQuestionsSolved >= totalQuestions) {
                match.state = 'ENDED';

                io.to(roomId).emit('battleEnded', {
                    winnerId: socket.id,
                    winnerName: socket.userData.username,
                    reason: 'completed_all_questions',
                    message: `${socket.userData.username} solved all ${totalQuestions} questions first!`
                });

                setTimeout(() => activeMatches.delete(roomId), 10000);
            }
        });

        // Handle Contest Time Expired (Rule 3 & Rule 4)
        socket.on('timeExpired', ({ roomId }) => {
            const match = activeMatches.get(roomId);
            if (!match || match.state !== 'ACTIVE') return;

            match.state = 'ENDED';
            const players = Array.from(match.players);
            if (players.length === 0) return;

            let winnerId = players[0];
            let reason = 'time_expired_most_questions';
            let message = 'Contest time expired!';

            if (players.length >= 2) {
                const p1 = players[0];
                const p2 = players[1];
                const prog1 = match.playerProgress.get(p1) || { questionsSolved: 0, passCount: 0, timeTakenMs: 99999999 };
                const prog2 = match.playerProgress.get(p2) || { questionsSolved: 0, passCount: 0, timeTakenMs: 99999999 };

                // Rule 3: Compare questions solved / tests passed
                if (prog1.questionsSolved > prog2.questionsSolved) {
                    winnerId = p1;
                    reason = 'time_expired_most_questions';
                    message = 'Time expired! Won by solving the most questions!';
                } else if (prog2.questionsSolved > prog1.questionsSolved) {
                    winnerId = p2;
                    reason = 'time_expired_most_questions';
                    message = 'Time expired! Won by solving the most questions!';
                } else if (prog1.passCount > prog2.passCount) {
                    winnerId = p1;
                    reason = 'time_expired_most_questions';
                    message = 'Time expired! Won by passing the most test cases!';
                } else if (prog2.passCount > prog1.passCount) {
                    winnerId = p2;
                    reason = 'time_expired_most_questions';
                    message = 'Time expired! Won by passing the most test cases!';
                } else {
                    // Rule 4: Tie-breaker by faster time taken
                    winnerId = prog1.timeTakenMs <= prog2.timeTakenMs ? p1 : p2;
                    reason = 'time_expired_faster_time';
                    message = 'Time expired! Tied on questions, but won with a faster completion time!';
                }
            }

            const winnerSocket = io.sockets.sockets.get(winnerId);
            const winnerName = winnerSocket?.userData?.username || 'Player';

            io.to(roomId).emit('battleEnded', {
                winnerId,
                winnerName,
                reason,
                message
            });

            setTimeout(() => activeMatches.delete(roomId), 10000);
        });

        // Join Battle Room Event (re-attaches room ID on page load)
        socket.on('joinBattleRoom', ({ roomId }) => {
            if (!roomId || typeof roomId !== 'string') return;
            socket.currentRoom = roomId;
            socket.join(roomId);

            let match = activeMatches.get(roomId);
            if (!match) {
                match = {
                    roomId,
                    players: new Map(),
                    state: 'ACTIVE',
                    startTime: Date.now(),
                    playerProgress: new Map()
                };
                activeMatches.set(roomId, match);
            }
            const username = socket.userData.username || 'Player';
            if (match.players instanceof Map) {
                match.players.set(username, { username, socketId: socket.id });
            } else {
                match.players = new Map([[username, { username, socketId: socket.id }]]);
            }
            console.log(`[Battle Arena Joined]: ${username} (${socket.id}) in room ${roomId}`);
        });

        // Helper: Handle Player Leave / Forfeit
        const handlePlayerLeave = (sock, targetRoomId) => {
            const roomId = targetRoomId || sock.currentRoom;
            if (!roomId) return;

            const match = activeMatches.get(roomId);
            if (match && match.state === 'ACTIVE') {
                const leavingUsername = sock.userData.username;
                let remainingUsername = null;
                let remainingSocketId = null;

                if (match.players instanceof Map) {
                    for (const [uname, pData] of match.players) {
                        if (uname !== leavingUsername) {
                            remainingUsername = uname;
                            remainingSocketId = pData.socketId;
                            break;
                        }
                    }
                }

                // Only declare forfeit if opponent was registered in the match
                if (!remainingUsername) {
                    console.log(`[Battle Leave Skipped]: ${leavingUsername} left room ${roomId} before opponent connected.`);
                    return;
                }

                match.state = 'ENDED';
                const winnerName = remainingUsername;
                const winnerId = remainingSocketId;

                console.log(`[Battle Forfeit Triggered]: ${leavingUsername} left room ${roomId}. Winner: ${winnerName} (${winnerId})`);

                io.to(roomId).emit('battleEnded', {
                    winnerId,
                    winnerName,
                    reason: 'opponent_forfeit',
                    message: `${leavingUsername} backed out / left the match. ${winnerName} wins by forfeit!`
                });

                sock.to(roomId).emit('opponentDisconnected', {
                    message: `${leavingUsername} left the match. ${winnerName} wins by forfeit!`,
                    winnerId,
                    winnerName,
                    reason: 'opponent_forfeit'
                });

                setTimeout(() => activeMatches.delete(roomId), 15000);
            }
        };

        // Explicit Leave / Back Button Forfeit Handler
        socket.on('leaveMatch', ({ roomId }) => {
            handlePlayerLeave(socket, roomId);
        });

        // Disconnect Handler
        socket.on('disconnect', () => {
            console.log(`[Socket Disconnected]: ${socket.id}`);
            removeFromQueues(socket);
            handlePlayerLeave(socket, socket.currentRoom);
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
