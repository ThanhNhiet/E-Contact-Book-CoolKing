const express = require('express');
const chatController = require('../controllers/chat.controller');
const router = express.Router();

// GET /api/chats/search?keyword=
router.get('/search', chatController.searchChatsByKeyword);

// POST /api/chats/group?course_section_id=&nameGroup=
router.post('/group', chatController.createGroupChat);

// POST /api/chats/private/:userID
router.post('/private/:userID', chatController.createPrivateChat);

// GET /api/chats/group-info/:course_section_id
router.get('/group-info/:course_section_id', chatController.getGroupChatInfoByCourseSection);

// PUT /api/chats/group/:chatID
router.put('/group/:chatID', chatController.updateGroupChat);

// DELETE /api/chats/cleanup-inactive
router.delete('/cleanup-inactive', chatController.deleteInactivePrivateChats);

// DELETE /api/chats/:chatID
router.delete('/:chatID', chatController.deleteChat);

// GET /api/chats?page=&pageSize=
router.get('/', chatController.getUserChats);

module.exports = router;