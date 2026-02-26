const _ = require('lodash');
const { sendPushNotificationIfNeeded } = require('./functions/notifications');
const { on } = require('form-data');
const { col } = require('sequelize');

// Lazy load models to avoid circular dependency
function getModels() {
  return require('./models');
}

let io;
const onlineUsers = new Map();
// Add this to track userId <-> socketId
const userIdToSocketId = new Map();

exports.socketConnection = (server) => {

    io = require('socket.io')(
        server, 
        {
            cors: {
                origin: [
                    // Production/staging domains
                    'http://192.168.1.170:6250',
                    /^http?:\/\/.*\.golura\.net(:\d+)?$/,
                    /^http?:\/\/golura\.net(:\d+)?$/,
                    // Development localhost
                    'http://localhost:6250',
                    'https://localhost:6250',
                    'http://localhost:6500',
                    'https://localhost:6500',
                    'http://localhost:3000',
                    'https://localhost:3000',
                    'http://127.0.0.1:6250',
                    'https://127.0.0.1:6250',
                    'http://127.0.0.1:6500',
                    'https://127.0.0.1:6500',
                    'http://127.0.0.1:3000',
                    'https://127.0.0.1:3000',
                    // Local network development
                    /^http?:\/\/192\.168\.\d+\.\d+:(6250|6500|3000)$/,
                    /^http?:\/\/10\.\d+\.\d+\.\d+:(6250|6500|3000)$/,
                    /^http?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+:(6250|6500|3000)$/
                ],
                methods: ["GET", "POST"]
            },
            allowEIO3: true,
            transports: ['websocket'],
            pingInterval: 25000,
            pingTimeout: 20000,
            cookie: false
        }
    );
    io.on(
        'connection', 
        function (socket) {
            const userId = socket.handshake.query.id;
            const user = { 
                id: userId, 
                lastActive: new Date(),
                ip: socket.handshake.address,
                online: 1
            };
            onlineUsers.set(
                socket.id, 
                user
            );
            // Track userId to socketId for direct lookup
            if (userId) {
                userIdToSocketId.set(String(userId), socket.id);
            }
            updateUserLastSeen(user);
            io.sockets.emit(
                'updateUserStatus', 
                Array.from(onlineUsers.values())
            );
          
            socket.on(
                'disconnect', 
                function (reason)  {

                    onlineUsers.delete(socket.id);
                    // Remove mapping on disconnect
                    if (userId) {
                        userIdToSocketId.delete(String(userId));
                    }
                    socket.disconnect();

                    io.emit(
                        'updateUserStatus', 
                        Array.from(onlineUsers.values())
                    );
                }
            );
            // Chat typing events (emit only to chat participants except sender)
            socket.on('chatTyping', async (data) => {
                console.log('chatTyping', data);
                if (!data?.chatRoomId || !data?.userId) return;
                // Get all participants in the chat room
                let participants = [];
                try {
                    const { ChatParticipant } = getModels();
                    participants = await ChatParticipant.findAll({
                        where: { chatRoomId: data.chatRoomId }
                    });
                } catch {}
                // Get user info for avatar/name
                let userInfo = { userId: data.userId };
                try {
                    const { User } = getModels();
                    const user = await User.findOne({ where: { id: data.userId } });
                    if (user) {
                        userInfo.firstName = user.firstName;
                        userInfo.profilePictureUrl = user.profilePictureUrl;
                    }
                } catch {}
                // Emit to all participants except sender
                for (const participant of participants) {
                    if (String(participant.userId) === String(data.userId)) continue;
                    const socketId = userIdToSocketId.get(String(participant.userId));
                    if (socketId && io.sockets.sockets.get(socketId)) {
                        io.to(socketId).emit('chatTyping', {
                            ...userInfo,
                            chatRoomId: data.chatRoomId,
                        });
                    }
                }
            });
            socket.on('chatStopTyping', async (data) => {
                // data: { chatRoomId, userId }
                if (!data?.chatRoomId || !data?.userId) return;
                let participants = [];
                try {
                    const { ChatParticipant } = getModels();
                    participants = await ChatParticipant.findAll({
                        where: { chatRoomId: data.chatRoomId, isActive: true }
                    });
                } catch {}
                for (const participant of participants) {
                    if (String(participant.userId) === String(data.userId)) continue;
                    const socketId = userIdToSocketId.get(String(participant.userId));
                    if (socketId && io.sockets.sockets.get(socketId)) {
                        io.to(socketId).emit('chatStopTyping', {
                            userId: data.userId,
                            chatRoomId: data.chatRoomId,
                        });
                    }
                }
            });
        }
    )
    setInterval(
        () => {
            const now = new Date();
            for (const [socketId, user] of onlineUsers.entries()) {
                user.online = false;

                if ((now - user.lastActive) > 120000) { 
                    // 2 minutes inactivity
                    onlineUsers.delete(socketId);
                } else {
                    user.online = true;
                    user.ip = io.sockets.sockets.get(socketId).handshake.address;
                    user.lastSeen = now;
                    onlineUsers.set(socketId, user);
                }
                updateUserLastSeen(user);
            };
            io.emit(
                'updateUserStatus', 
                Array.from(onlineUsers.values())
            );
        }, 
        30000
    );
};

exports.sendToSpecific = async (userId, message, data) => {
    // Try direct lookup first
    const socketId = userIdToSocketId.get(String(userId));
    if (socketId && io.sockets.sockets.get(socketId)) {
        console.log(`Sending message to userId ${userId} on socket ${socketId}`);
        io.to(socketId).emit(message, data);
        return;
    }
    // Fallback to old method (in case of multiple connections per user)
    for (const [sid, user] of onlineUsers.entries()) {
        if (parseInt(user.id) === parseInt(userId)) {
            io.to(sid).emit(message, data);
            return;
        }
    }
};
exports.updateCount = (userId, type, count) => {
    for (const [socketId, user] of onlineUsers.entries()) {
        if (parseInt(user.id) === userId) {
            io.to(socketId).emit('updateCount',{type, count});
            return;
        }
    }
};
exports.updateActivities = (userId, activity) => {
    for (const [socketId, user] of onlineUsers.entries()) {
        if (parseInt(user.id) === userId) {
            io.to(socketId).emit('updateActivities', activity);
            return;
        }
    }
};
exports.getOnlineUsers = () => {
    return Array.from(onlineUsers.values());
};
exports.getOnlineUser = (userId) => {
    for (const [socketId, user] of onlineUsers.entries()) {
        if (parseInt(user.id) === userId) {
            return user;
        }
    }
    return null;
};
const updateUserLastSeen = async (user) =>  {
    const now = new Date();
    try {
        const { User } = getModels();
        const socketUser = await User.findOne(
            { 
                where: { 
                    id: user.id 
                } 
            }
        );
        
        socketUser.online = user.online;
        socketUser.lastSeen = now;
        socketUser.save();

    } catch (err) {
        console.log(err.message)
    }
}