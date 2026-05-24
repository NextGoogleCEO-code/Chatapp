import express from 'express';
import Conversation from '../models/Conversation.js';
import User from '../models/User.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// GET /api/conversations
// Get all conversations the current user is part of, with last message preview.
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
      .populate('participants', 'username')
      .sort({ updatedAt: -1 });

    // Shape the response: replace participants with "otherUser"
    const shaped = conversations.map((conv) => {
      const other = conv.participants.find(
        (p) => p._id.toString() !== req.user.id
      );
      return {
        _id: conv._id,
        otherUser: other ? { _id: other._id, username: other.username } : null,
        lastMessage: conv.lastMessage,
        updatedAt: conv.updatedAt
      };
    });

    res.json(shaped);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversations: ' + err.message });
  }
});

// POST /api/conversations
// Start or retrieve an existing conversation with another user.
// Body: { userId }
router.post('/', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required.' });
  }

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot start a conversation with yourself.' });
  }

  try {
    const otherUser = await User.findById(userId).select('_id username');
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if a conversation already exists between these two users
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user.id, userId], $size: 2 }
    }).populate('participants', 'username');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user.id, userId]
      });
      conversation = await Conversation.findById(conversation._id).populate(
        'participants',
        'username'
      );
    }

    const other = conversation.participants.find(
      (p) => p._id.toString() !== req.user.id
    );

    res.status(201).json({
      _id: conversation._id,
      otherUser: other ? { _id: other._id, username: other.username } : null,
      lastMessage: conversation.lastMessage,
      updatedAt: conversation.updatedAt
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create conversation: ' + err.message });
  }
});

export default router;
