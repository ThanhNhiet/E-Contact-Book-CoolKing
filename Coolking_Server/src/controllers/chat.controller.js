const chatRepo = require('../repositories/chat.repo');
const jwtUtils = require('../utils/jwt.utils');

// POST /api/chats/group?course_section_id=&nameGroup=
exports.createGroupChat = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { nameGroup, course_section_id } = req.query;
        if (!nameGroup || !course_section_id) {
            return res.status(400).json({
                success: false,
                message: 'Tên nhóm và mã course section là bắt buộc'
            });
        }
        const chat = await chatRepo.createGroupChat4Admin(decoded.user_id, nameGroup, course_section_id);
        res.status(201).json(chat);
    } catch (error) {
        console.error('Error in createGroupChat controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo nhóm chat'
        });
    }
};

// POST /api/chats/private/:userID
exports.createPrivateChat = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { userID } = req.params;
        if (!userID) {
            return res.status(400).json({
                success: false,
                message: 'userID là bắt buộc'
            });
        }
        const chat = await chatRepo.createPrivateChat4Users(decoded.user_id, userID);
        res.status(201).json(chat);
    } catch (error) {
        console.error('Error in createPrivateChat controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo cuộc trò chuyện'
        });
    }
};

// GET /api/chats/group-info/:course_section_id
exports.getGroupChatInfoByCourseSection = async (req, res) => {
    try {
        const { course_section_id } = req.params;
        if (!course_section_id) {
            return res.status(400).json({
                success: false,
                message: 'course_section_id là bắt buộc'
            });
        }
        const chat = await chatRepo.getGroupChatInfoByCourseSection4Admin(course_section_id);
        res.status(200).json(chat);
    } catch (error) {
        console.error('Error in getGroupChatInfoByCourseSection controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy thông tin nhóm chat'
        });
    }
};

// PUT /api/chats/group/:chatID
exports.updateGroupChat = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID } = req.params;
        const updateData = req.body; // {name?, students: [], lecturers: []}
        
        if (!chatID) {
            return res.status(400).json({
                success: false,
                message: 'chatID là bắt buộc'
            });
        }

        const chat = await chatRepo.updateGroupChat4Admin(decoded.user_id, chatID, updateData);
        res.status(200).json(chat);
    } catch (error) {
        console.error('Error in updateGroupChat controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật nhóm chat'
        });
    }
};

// DELETE /api/chats/:chatID
exports.deleteChat = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID } = req.params;
        if (!chatID) {
            return res.status(400).json({
                success: false,
                message: 'chatID là bắt buộc'
            });
        }
        const result = await chatRepo.deleteGroupChat4Admin(chatID);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error in deleteChat controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi xóa cuộc trò chuyện'
        });
    }
};