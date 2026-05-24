import express from 'express';
import Message from '../models/Message.js';
import mongoose from 'mongoose';
import protect from '../middleware/auth.js';

const router = express.Router();

// All message routes require a valid JWT
router.use(protect);

// GET: Retrieve all messages sorted by time
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const messages = await Message.find().sort({ timestamp: 1 });
      return res.json(messages);
    } else {
      return res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve messages: ' + error.message });
  }
});

// POST: Send a new message. Sender is taken from the JWT token.
router.post('/', async (req, res) => {
  const { text } = req.body;
  const sender = req.user.username;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    if (mongoose.connection.readyState === 1) {
      const message = new Message({ sender, text: text.trim() });
      const saved = await message.save();
      return res.status(201).json(saved);
    } else {
      // If no DB, return the message with a mock id so the frontend can still display it
      return res.status(201).json({
        _id: 'mock-' + Date.now(),
        sender,
        text: text.trim(),
        timestamp: new Date()
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message: ' + error.message });
  }
});

export default router;
