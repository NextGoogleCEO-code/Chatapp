import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  // Authenticate every socket connection using the JWT passed in handshake.auth
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided.'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme_secret');
      socket.user = decoded; // attach user info to socket
      next();
    } catch (err) {
      next(new Error('Invalid token.'));
    }
  });

  io.on('connection', (socket) => {
    // Join a personal room so we can send them global events like conversation updates
    if (socket.user && socket.user.id) {
      socket.join(socket.user.id);
    }

    // Client emits this when they open a conversation
    socket.on('join_conversation', (conversationId) => {
      socket.join(conversationId);
    });

    // Client emits this when they leave/close a conversation
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on('disconnect', () => {});
  });

  return io;
};

// Used by the messages route to emit events
export const getIO = () => io;
