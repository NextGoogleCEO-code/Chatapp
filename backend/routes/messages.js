import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Helper: verify the requesting user is a participant in the conversation
async function verifyParticipant(conversationId, userId, res) {
  const conv = await Conversation.findById(conversationId);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return null;
  }
  const isParticipant = conv.participants.some((p) => p.toString() === userId);
  if (!isParticipant) {
    res.status(403).json({ error: 'Access denied.' });
    return null;
  }
  return conv;
}

// GET /api/messages/:conversationId
router.get('/:conversationId', async (req, res) => {
  try {
    const conv = await verifyParticipant(req.params.conversationId, req.user.id, res);
    if (!conv) return;

    const messages = await Message.find({ conversation: req.params.conversationId })
      .sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages: ' + err.message });
  }
});

// POST /api/messages/:conversationId
router.post('/:conversationId', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    const conv = await verifyParticipant(req.params.conversationId, req.user.id, res);
    if (!conv) return;

    const message = await Message.create({
      conversation: req.params.conversationId,
      sender: req.user.username,
      text: text.trim()
    });

    // Update lastMessage snapshot on the conversation
    await Conversation.findByIdAndUpdate(req.params.conversationId, {
      lastMessage: {
        text: text.trim(),
        sender: req.user.username,
        timestamp: message.timestamp
      },
      updatedAt: new Date()
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message: ' + err.message });
  }
});

export default router;
