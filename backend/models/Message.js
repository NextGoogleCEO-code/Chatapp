import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
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
  {
    timestamps: true // adds createdAt and updatedAt
  }
);

const Message = mongoose.model('Message', MessageSchema);

export default Message;
