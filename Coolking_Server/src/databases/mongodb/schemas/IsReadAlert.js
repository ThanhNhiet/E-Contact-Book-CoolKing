const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const isReadAlertSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    alertID: {
        type: String,
        required: true
    },
    receiverID: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

isReadAlertSchema.index({ alertID: 1, receiverID: 1 });

const IsReadAlert = mongoose.model('IsReadAlert', isReadAlertSchema);
module.exports = IsReadAlert;
