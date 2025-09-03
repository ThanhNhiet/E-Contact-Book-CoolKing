const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Alert schema
const alertSchema = new Schema({
  _id: {
    type: String,
    required: true
  },
  senderID: {
    type: String,
    required: true,
    ref: 'Account'
  },
  receiverID: {
    type: String,
    required: true,
    ref: 'Account'
  },
  header: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  targetScope: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isRead: {
    type: Boolean,
    default: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Add indexes
alertSchema.index({ receiverID: 1, createdAt: -1 });
alertSchema.index({ isRead: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
