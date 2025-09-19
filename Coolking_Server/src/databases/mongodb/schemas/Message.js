const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define MessageType enum
const MessageType = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  VIDEO: 'video',
  EMOJI: 'emoji',
  DOC: 'doc',
  AUDIO: 'audio',
  UNSEND: 'unsend',
  NOTIFICATION: 'notification'
};

// Define MessageStatus enum
const MessageStatus = {
  SEND: 'send',
  READ: 'read',
  DELIVERED: 'delivered'
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
  },
  media_url: [String]
}, { _id: false });

// Define PinnedInfo schema as a subdocument
const pinnedInfoSchema = new Schema({
  pinnedBy: {
    type: String,
    required: true
  },
  pinnedDate: {
    type: Date,
    default: Date.now
  },
  messageID: {
    type: String,
    required: true
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
  mediaUrls: [String],
  replyTo: {
    type: replyInfoSchema
  },
  messageID: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: Object.values(MessageStatus),
    default: MessageStatus.SEND
  },
  pinnedInfo: {
    type: pinnedInfoSchema
  }
}, {
  timestamps: true
});

// Add indexes
messageSchema.index({ chatID: 1, timestamp: -1 });
messageSchema.index({ messageID: 1 }, { unique: true });

const Message = mongoose.model('Message', messageSchema);

module.exports = {
  Message,
  MessageType,
  MessageStatus
};
