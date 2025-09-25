const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define MessageType enum
const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  LINK: 'link'
};

// Define MessageStatus enum
const MessageStatus = {
  SENDING: 'sending',
  SENT: 'sent',
  READ: 'read'
};

// Define ReplyInfo schema as a subdocument
const replyInfoSchema = new Schema({
  messageID: {
    type: String,
    required: true
  },
  senderID: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  content: {
    type: String
  }
}, { _id: false });

// Define PinnedInfo schema as a subdocument
const pinnedInfoSchema = new Schema({
  messageID: {
    type: String,
    required: true
  },
  pinnedBy: {
    type: String,
    required: true
  },
  pinnedDate: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

// Define the Message schema
const messageSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  chatID: {
    type: String,
    required: true,
    ref: 'Chat'
  },
  senderID: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(MessageType),
    required: true
  },
  content: {
    type: String
  },
  filename: {
    type: String
  },
  replyTo: {
    type: replyInfoSchema
  },
  pinnedInfo: {
    type: pinnedInfoSchema
  },
  status: {
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.SENT
  }
}, {
  timestamps: true
});

// Add indexes
messageSchema.index({ chatID: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  Message,
  MessageType,
  MessageStatus
};
