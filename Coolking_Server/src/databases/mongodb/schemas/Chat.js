const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define ChatType enum
const ChatType = {
  PRIVATE: 'private',
  GROUP: 'group'
};

// Define the Chat schema
const chatSchema = new Schema({
  chatID: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(ChatType),
    required: true
  },
  name: {
    type: String,
    required: function() {
      return this.type === ChatType.GROUP;
    }
  },
  avatar: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: String
  },
  _id: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Virtual for members (populated from ChatMembers)
chatSchema.virtual('members', {
  ref: 'ChatMember',
  localField: '_id',
  foreignField: 'chat'
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = {
  Chat,
  ChatType
};
