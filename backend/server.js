import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/chatapp';

// Middleware
app.use(cors());
app.use(express.json());

// Basic Status Route
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    message: 'Chatapp Backend Server is running smoothly.',
    timestamp: new Date()
  });
});

// Database Connection
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully.'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Running in offline database fallback mode (data will not persist).');
  });

app.listen(PORT, () => {
  console.log(\🚀 Server listening on http://localhost:\\);
});
