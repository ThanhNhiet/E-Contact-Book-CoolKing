const express = require('express');
const messageController = require('../controllers/message.controller');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

// POST /api/messages/text
router.post('/text', messageController.createMessageText);

// POST /api/messages/file
router.post('/file', upload.uploadd, messageController.createMessageFile);

// POST /api/messages/image
router.post('/image', upload.uploadd, messageController.createMessageImage);

// POST /api/messages/text/reply
router.post('/text/reply',  messageController.createMessageTextReply);

// POST /api/messages/file/reply
router.post('/file/reply', upload.uploadd, messageController.createMessageFileReply);

// POST /api/messages/image/reply

router.post('/image/reply', upload.uploadd, messageController.createMessageImageReply);

// POST /api/messages/pinned
router.post('/pinned', messageController.createdMessagePinned);

// GET /api/messages/:chatID
router.get('/:chatID', messageController.getMessagesByChatID);

// PUT /api/messages/:messageID/status
router.put('/:messageID/status', messageController.updateMessageStatus);


// GET /api/messages/last/:chatID
router.get('/last/:chatID', messageController.getLastMessageByChatID);

module.exports = router;