import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatapp';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

// Basic health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// Database connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB.'))
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Running without database. Messages will not persist.');
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
