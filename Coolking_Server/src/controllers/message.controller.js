const messageRepo = require('../repositories/message.repo');
const jwtUtils = require('../utils/jwt.utils');


// POST /api/messages/text
exports.createMessageText = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID, text } = req.body;
        
        if (!chatID || !text) {
            return res.status(400).json({
                success: false,
                message: 'chatID và text là bắt buộc'
            });
        }

        if (!decoded.user_id) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy thông tin người gửi trong token'
            });
        }

        const newMessage = await messageRepo.createMessageText({
            chatID,
            senderID: decoded.user_id,
            content: text
        });

        return res.status(201).json(
            newMessage
    );

    } catch (error) {
        console.error('Error in createMessageText controller:', error);
       res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn văn bản'
        });
    }
};

// POST /api/messages/file
exports.createMessageFile = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { chatID } = req.body;

        if (!chatID || !req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'chatID và file là bắt buộc'
            });
        }

        const newMessage = await messageRepo.createMessageFile({
            chatID,
            senderID: decoded.user_id,
            files: req.files  // Use the array of files directly
        });

        return res.status(201).json(
            newMessage
        );

    } catch (error) {
        console.error('Error in createMessageFile controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn file'
        });
    }
};

// POST /api/messages/image
exports.createMessageImage = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID } = req.body;
        if (!chatID || !req.files || req.files.length === 0) {
            return res.status(400).json({   
                success: false,
                message: 'chatID và file là bắt buộc'
            });
        }

        const newMessage = await messageRepo.createMessageImage({
            chatID,
            senderID: decoded.user_id,
            images: req.files  // Use the array of files directly
        });

        return res.status(201).json(
            newMessage
        );

    } catch (error) {
        console.error('Error in createMessageImage controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn hình ảnh'
        });
    }
};  

// POST /api/messages/TextReply
exports.createMessageTextReply = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { chatID, text, replyTo } = req.body;

        if (!chatID || !text) {
            return res.status(400).json({
                success: false,
                message: 'chatID và text là bắt buộc'
            });
        }

        if (!decoded.user_id) {
            return res.status(400).json({
                success: false,
                message: 'Không tìm thấy thông tin người gửi trong token'
            });
        }

        const newMessage = await messageRepo.createMessageTextReply({
            chatID,
            senderID: decoded.user_id,
            content: text,
            replyTo: replyTo
        });

        return res.status(201).json(
            newMessage
        );

    } catch (error) {
        console.error('Error in createMessageReply controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn phản hồi'
        });
    }
};

// Post /api/messages/fileReply
exports.createMessageFileReply = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { chatID, files, replyTo } = req.body;
        if (!chatID || !files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'chatID và file là bắt buộc'
            });
        }

        const newMessage = await messageRepo.createMessageFileReply({
            chatID,
            senderID: decoded.user_id,
            files,
            replyTo
        });

        return res.status(201).json(
            newMessage
        );

    } catch (error) {
        console.error('Error in createMessageFileReply controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn phản hồi'
        });
    }
};
// Post /api/messages/imageReply
exports.createMessageImageReply = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { chatID, images, replyTo } = req.body;
        if (!chatID || !images || images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'chatID và hình ảnh là bắt buộc'
            });
        }

        const newMessage = await messageRepo.createMessageImageReply({
            chatID,
            senderID: decoded.user_id,
            images,
            replyTo
        });

        return res.status(201).json(
            newMessage
        );

    } catch (error) {
        console.error('Error in createMessageImageReply controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi tạo tin nhắn phản hồi'
        });
    }
};

// Post /api/messages/pinned
exports.createdMessagePinned = async (req, res) => {
    try {   
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID, messageID, pinnedBy } = req.body;
        if (!chatID || !messageID || !pinnedBy) {
            return res.status(400).json({
                success: false,
                message: 'chatID, messageID và pinnedBy là bắt buộc'
            });
        }
        const newMessage = await messageRepo.createdMessagePinned({ chatID, messageID, pinnedBy });
        return res.status(200).json(newMessage);
    } catch (error) {
        console.error('Error in createdMessagePinned controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi ghim tin nhắn'
        });
    }
};
// GET /api/messages/:chatID
exports.getMessagesByChatID = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { chatID } = req.params;
        if (!chatID) {
            return res.status(400).json({
                success: false,
                message: 'chatID là bắt buộc'
            });
        }   
        const paginationOptions = {
            page: req.query.page,
            limit: req.query.limit,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };
        const messages = await messageRepo.getMessagesByChatID(chatID, paginationOptions);
        return res.status(200).json(messages);

    } catch (error) {
        console.error('Error in getMessagesByChatID controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy tin nhắn'
        });
    }
};
// PUT /api/messages/:messageID/status
exports.updateMessageStatus = async (req, res) => {
    try {       
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);  
        if (!decoded) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { messageID } = req.params;
        const { status } = req.body;
        if (!messageID || !status) {
            return res.status(400).json({
                success: false,
                message: 'messageID và status là bắt buộc'
            });
        }   
        const updatedMessage = await messageRepo.updateMessageStatus(messageID, status);
        return res.status(200).json(updatedMessage);
    } catch (error) {
        console.error('Error in updateMessageStatus controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi cập nhật trạng thái tin nhắn'
        });
    }   
};