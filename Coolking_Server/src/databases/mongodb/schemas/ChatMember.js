const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the role enum
const MemberRole = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

// Define the ChatMember schema
const chatMemberSchema = new Schema({
  chat: {
    type: String,
    required: true,
    ref: 'Chat'
  },
  userID: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: Object.values(MemberRole),
    default: MemberRole.MEMBER
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  muted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Composite index to ensure a user is only added once to a chat
chatMemberSchema.index({ chat: 1, userID: 1 }, { unique: true });

const ChatMember = mongoose.model('ChatMember', chatMemberSchema);

module.exports = {
  ChatMember,
  MemberRole
};
