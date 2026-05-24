import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: String, default: '' },
      timestamp: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

// Ensure only one conversation exists per pair of users
ConversationSchema.index({ participants: 1 });

const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
