import { createServer } from 'http';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import conversationRoutes from './routes/conversations.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Attach Socket.io to the HTTP server (must be before routes)
initSocket(httpServer);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatapp';

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

// Listen on httpServer, not app, so Socket.io works
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
