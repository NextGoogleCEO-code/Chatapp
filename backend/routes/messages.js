import express from 'express';
import Message from '../models/Message.js';
import mongoose from 'mongoose';

const router = express.Router();

// Mock/In-memory seed data to represent a development timeline history
const seedTimelineMessages = [
  {
    _id: "seed-1",
    sender: "Aneekesh",
    text: "Hey, did we get the empty GitHub repository cloned?",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
  },
  {
    _id: "seed-2",
    sender: "Alex",
    text: "Yes, I successfully cloned it locally! It's completely empty.",
    timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
    createdAt: new Date(Date.now() - 23 * 60 * 60 * 1000)
  },
  {
    _id: "seed-3",
    sender: "Aneekesh",
    text: "Awesome. Let's make it a MERN stack app today.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    _id: "seed-4",
    sender: "Alex",
    text: "Perfect, starting by building the Node.js + Express backend first.",
    timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
  },
  {
    _id: "seed-5",
    sender: "Aneekesh",
    text: "Great, let's make sure the chat history renders as a timeline in the UI, and keep git commits sequential so we can see the development history too.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    createdAt: new Date(Date.now() - 30 * 60 * 1000)
  }
];

let memoryDB = [...seedTimelineMessages];

// GET: Retrieve message logs / timeline
router.get('/', async (req, res) => {
  try {
    // If MongoDB is connected, fetch from database. If database is empty, seed it.
    if (mongoose.connection.readyState === 1) {
      let dbMessages = await Message.find().sort({ timestamp: 1 });
      
      // Seed DB if it's empty so the user always sees a timeline
      if (dbMessages.length === 0) {
        await Message.insertMany(seedTimelineMessages.map(({ _id, ...rest }) => rest));
        dbMessages = await Message.find().sort({ timestamp: 1 });
      }
      return res.json(dbMessages);
    } else {
      // Fallback to in-memory store
      return res.json(memoryDB);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve chat logs: ' + error.message });
  }
});

// POST: Post a new message
router.post('/', async (req, res) => {
  const { sender, text } = req.body;

  if (!sender || !text) {
    return res.status(400).json({ error: 'Sender and Text are required fields' });
  }

  try {
    const newMessageData = {
      sender,
      text,
      timestamp: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const dbMessage = new Message(newMessageData);
      const savedMessage = await dbMessage.save();
      return res.status(201).json(savedMessage);
    } else {
      const mockMessage = {
        _id: 'mock-' + Math.random().toString(36).substr(2, 9),
        ...newMessageData,
        createdAt: newMessageData.timestamp
      };
      memoryDB.push(mockMessage);
      return res.status(201).json(mockMessage);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to save message: ' + error.message });
  }
});

export default router;
