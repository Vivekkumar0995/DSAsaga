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
                    players: new Set([p1.id, p2.id]),
                    state: 'ACTIVE',
                    topic: sanitizedTopic
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
                players: new Set(roomSockets),
                state: 'ACTIVE',
                topic
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

        // Progress Tracking
        socket.on('submitAttempt', ({ roomId, passCount, totalTests, isCompleted }) => {
            if (isRateLimited(socket, 20, 5000)) return;
            if (typeof roomId !== 'string' || !Number.isInteger(passCount) || !Number.isInteger(totalTests) || typeof isCompleted !== 'boolean') {
                return;
            }

            const match = activeMatches.get(roomId);
            if (!match || !match.players.has(socket.id) || match.state !== 'ACTIVE') {
                return;
            }

            const safePassCount = Math.max(0, Math.min(passCount, totalTests));

            socket.to(roomId).emit('opponentProgress', {
                senderId: socket.id,
                passCount: safePassCount,
                totalTests,
                isCompleted
            });

            if (isCompleted && safePassCount === totalTests) {
                match.state = 'ENDED';

                io.to(roomId).emit('battleEnded', {
                    winnerId: socket.id,
                    winnerName: socket.userData.username
                });

                setTimeout(() => activeMatches.delete(roomId), 10000);
            }
        });

        // Disconnect Handler
        socket.on('disconnect', () => {
            console.log(`[Socket Disconnected]: ${socket.id}`);
            removeFromQueues(socket);

            if (socket.currentRoom) {
                const roomId = socket.currentRoom;
                const match = activeMatches.get(roomId);

                if (match && match.state === 'ACTIVE') {
                    match.state = 'ENDED';

                    socket.to(roomId).emit('opponentDisconnected', {
                        message: `${socket.userData.username} disconnected. You win by forfeit!`,
                        winnerId: Array.from(match.players).find(id => id !== socket.id)
                    });

                    setTimeout(() => activeMatches.delete(roomId), 5000);
                }
            }
        });
    });

    httpServer.listen(port, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${port}`);
    });
});
