import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },
    sender: {
      type: String,
      required: true,
      trim: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', MessageSchema);

export default Message;
