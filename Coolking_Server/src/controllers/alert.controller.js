const alertRepo = require('../repositories/alert.repo');
const jwtUtils = require('../utils/jwt.utils');

/**
 * Gửi thông báo đến tất cả người dùng (Admin only)
 * POST /api/alerts/send-all
 */
const sendAlertToAll = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { header, body } = req.body;
        // Validate input
        if (!header || !body) {
            return res.status(400).json({
                success: false,
                message: 'Tiêu đề và nội dung là bắt buộc'
            });
        }

        // Gọi repository để gửi thông báo
        const result = await alertRepo.sendAlertToAll(decoded.user_id, header, body);

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in sendAlertToAll controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi gửi thông báo'
        });
    }
};

/**
 * Gửi thông báo đến một người dùng cụ thể
 * POST /api/alerts/send-person
 */
const sendAlertToPerson = async (req, res) => {
    try {
        // Lấy thông tin người gửi từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        if (!decoded || decoded.role !== 'LECTURER') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        const { receiversID, header, body } = req.body;

        // Validate input
        if (!receiversID || !header || !body) {
            return res.status(400).json({
                success: false,
                message: 'Người nhận, tiêu đề và nội dung là bắt buộc'
            });
        }

        // Validate receiversID là mảng
        if (!Array.isArray(receiversID) || receiversID.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Danh sách người nhận không được rỗng'
            });
        }

        // Gọi repository để gửi thông báo
        const result = await alertRepo.sendAlertToPerson(
            decoded.user_id,
            receiversID,
            header,
            body
        );

        res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in sendAlertToPerson controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi gửi thông báo'
        });
    }
};

/**
 * Lấy danh sách thông báo của người dùng hiện tại
 * GET /api/alerts/my-alerts?page=1&pageSize=10
 */
const getMyAlerts = async (req, res) => {
    try {
        // Lấy thông tin người dùng từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);

        // Lấy pagination params
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Validate pagination
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return res.status(400).json({
                success: false,
                message: 'Page phải >= 1 và pageSize phải từ 1-100'
            });
        }

        // Gọi repository để lấy thông báo
        const result = await alertRepo.getAlertsByUser(decoded.user_id, page, pageSize);

        res.status(200).json(result);

    } catch (error) {
        console.error('Error in getMyAlerts controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách thông báo'
        });
    }
};

/**
 * Lấy danh sách thông báo của một user cụ thể (Admin only)
 * GET /api/alerts/user/:userID?page=1&pageSize=10
 */
const getUserAlerts = async (req, res) => {
    try {
        const { userID } = req.params;

        // Validate userID
        if (!userID) {
            return res.status(400).json({
                success: false,
                message: 'UserID là bắt buộc'
            });
        }

        // Lấy pagination params
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;

        // Validate pagination
        if (page < 1 || pageSize < 1 || pageSize > 100) {
            return res.status(400).json({
                success: false,
                message: 'Page phải >= 1 và pageSize phải từ 1-100'
            });
        }

        // Gọi repository để lấy thông báo
        const result = await alertRepo.getAlertsByUser(userID, page, pageSize);

        res.status(200).json({
            success: true,
            message: 'Lấy danh sách thông báo thành công',
            data: result.data
        });

    } catch (error) {
        console.error('Error in getUserAlerts controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách thông báo'
        });
    }
};

/**
 * Đánh dấu thông báo đã đọc
 * PUT /api/alerts/:alertId/read
 */
const markAlertAsRead = async (req, res) => {
    try {
        // Lấy thông tin người dùng từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const userID = decoded.user_id;

        const { alertId } = req.params;

        // Validate alertId
        if (!alertId) {
            return res.status(400).json({
                success: false,
                message: 'AlertId là bắt buộc'
            });
        }

        // Gọi repository để đánh dấu đã đọc
        const result = await alertRepo.markAlertAsRead(alertId, userID);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in markAlertAsRead controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi đánh dấu đã đọc'
        });
    }
};

/**
 * Xóa thông báo
 * DELETE /api/alerts/:alertId
 */
const deleteAlert = async (req, res) => {
    try {
        // Lấy thông tin người dùng từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const userID = decoded.user_id;
        const userRole = decoded.role;

        const { alertId } = req.params;

        // Validate alertId
        if (!alertId) {
            return res.status(400).json({
                success: false,
                message: 'AlertId là bắt buộc'
            });
        }

        // Gọi repository để xóa thông báo
        const result = await alertRepo.deleteAlert(alertId, userID, userRole);

        res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });

    } catch (error) {
        console.error('Error in deleteAlert controller:', error);

        // Xử lý lỗi permission
        if (error.message.includes('không có quyền') || error.message.includes('admin')) {
            return res.status(403).json({
                success: false,
                message: error.message
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi xóa thông báo'
        });
    }
};

/**
 * Lấy số lượng thông báo chưa đọc
 * GET /api/alerts/unread-count
 */
const getUnreadCount = async (req, res) => {
    try {
        // Lấy thông tin người dùng từ token
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        const decoded = jwtUtils.verifyAccessToken(token);
        const userID = decoded.user_id;

        // Gọi repository để lấy thông báo (chỉ lấy 1 item để có unreadCount)
        const result = await alertRepo.getAlertsByUser(userID, 1, 1);

        res.status(200).json({
            success: true,
            message: 'Lấy số thông báo chưa đọc thành công',
            data: {
                unreadCount: result.data.unreadCount
            }
        });

    } catch (error) {
        console.error('Error in getUnreadCount controller:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy số thông báo chưa đọc'
        });
    }
};

module.exports = {
    sendAlertToAll,
    sendAlertToPerson,
    getMyAlerts,
    getUserAlerts,
    markAlertAsRead,
    deleteAlert,
    getUnreadCount
};