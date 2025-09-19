const { v4: uuidv4 } = require('uuid');
const { Alert } = require('../databases/mongodb/schemas');
const mongoose = require('mongoose');
const datetimeFormatter = require("../utils/format/datetime-formatter");

/**
 * Gửi thông báo đến tất cả người dùng
 * @param {Object} alertData - Dữ liệu thông báo
 * @param {String} alertData.header - Tiêu đề thông báo
 * @param {String} alertData.body - Nội dung thông báo
 * @returns {Object} - Kết quả tạo thông báo
 */
const sendAlertToAll = async (user_id, header, body) => {
    try {
        // Validate input
        if (!header || !body) {
            throw new Error('Header và body là bắt buộc');
        }

        // Tạo alert với targetScope = 'all' và senderID = null
        const alert = new Alert({
            _id: uuidv4(),
            senderID: user_id,
            receiverID: null, // Không có receiver cụ thể vì gửi cho all
            header: header.trim(),
            body: body.trim(),
            targetScope: 'all',
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Lưu vào database
        await alert.save();

        return {
            success: true,
            message: 'Gửi thông báo thành công đến tất cả người dùng'
        };

    } catch (error) {
        console.error('Error in sendAlertToAll:', error);
        throw new Error(`Lỗi khi gửi thông báo: ${error.message}`);
    }
};

/**
 * Gửi thông báo đến nhiều người dùng cụ thể
 * @param {String} senderID - ID người gửi
 * @param {Array} receiversID - Mảng ID người nhận ["1", "2", "3"]
 * @param {String} header - Tiêu đề thông báo
 * @param {String} body - Nội dung thông báo
 * @returns {Object} - Kết quả tạo thông báo
 */
const sendAlertToPerson = async (senderID, receiversID, header, body) => {
    try {
        // Validate input
        if (!senderID || !receiversID || !header || !body) {
            throw new Error('SenderID, receiversID, header và body là bắt buộc');
        }

        // Validate receiversID là mảng và không rỗng
        if (!Array.isArray(receiversID) || receiversID.length === 0) {
            throw new Error('ReceiversID phải là mảng và không được rỗng');
        }

        const alertsToCreate = [];

        // Tạo alert cho từng receiver
        for (const receiverID of receiversID) {
            if (!receiverID || receiverID.trim() === '') {
                console.warn(`Bỏ qua receiverID không hợp lệ: ${receiverID}`);
                continue;
            }

            const alert = new Alert({
                _id: uuidv4(),
                senderID: senderID,
                receiverID: receiverID.trim(),
                header: header.trim(),
                body: body.trim(),
                targetScope: 'person',
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            alertsToCreate.push(alert);
        }

        // Bulk insert tất cả alerts
        if (alertsToCreate.length > 0) {
            await Alert.insertMany(alertsToCreate);
        }

        return {
            success: true,
            message: `Gửi thông báo thành công`
        };

    } catch (error) {
        console.error('Error in sendAlertToPerson:', error);
        throw new Error(`Lỗi khi gửi thông báo: ${error.message}`);
    }
};

/**
 * Lấy danh sách thông báo cho một người dùng
 * @param {String} userID - ID người dùng
 * @param {Number} page - Trang hiện tại (default: 1)
 * @param {Number} pageSize - Số lượng alert mỗi trang (default: 10)
 * @returns {Object} - Danh sách thông báo
 */
const getAlertsByUser = async (userID, page = 1, pageSize = 10) => {
    try {
        if (!userID) {
            throw new Error('UserID là bắt buộc');
        }

        const skip = (page - 1) * pageSize;
        const currentDate = new Date();
        const sevenDaysAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Lấy thông báo cho user cụ thể và thông báo cho tất cả
        const alerts = await Alert.find({
            $or: [
                { receiverID: userID, targetScope: 'person' }, // Thông báo cá nhân
                { targetScope: 'all' } // Thông báo cho tất cả
            ]
        })
            .sort({ updatedAt: -1 }) // Sắp xếp theo thời gian updatedAt giảm dần
            .skip(skip)
            .limit(pageSize)
            .select('_id senderID receiverID header body targetScope isRead createdAt updatedAt');

        // Xử lý dữ liệu alerts
        const processedAlerts = alerts.map(alert => {
            let isRead = alert.isRead;

            // Xử lý logic đặc biệt cho targetScope: 'all'
            if (alert.targetScope === 'all' && alert.updatedAt < sevenDaysAgo) {
                isRead = true; // Mặc định set isRead = true nếu quá 7 ngày
            }

            return {
                _id: alert._id,
                senderID: alert.senderID,
                receiverID: alert.receiverID,
                header: alert.header,
                body: alert.body,
                targetScope: alert.targetScope,
                isRead: isRead,
                createdAt: datetimeFormatter.formatDateTimeVN(alert.createdAt),
                updatedAt: datetimeFormatter.formatDateTimeVN(alert.updatedAt)
            };
        });

        // Đếm tổng số thông báo
        const total = await Alert.countDocuments({
            $or: [
                { receiverID: userID, targetScope: 'person' },
                { targetScope: 'all' }
            ]
        });

        // Đếm số thông báo chưa đọc
        const personalUnreadCount = await Alert.countDocuments({
            receiverID: userID,
            targetScope: 'person',
            isRead: false
        });

        // Đếm thông báo 'all' chưa đọc (chỉ tính những thông báo trong vòng 7 ngày)
        const allUnreadCount = await Alert.countDocuments({
            targetScope: 'all',
            isRead: false,
            updatedAt: { $gte: sevenDaysAgo }
        });

        const unreadCount = personalUnreadCount + allUnreadCount;

        // Tạo pagination links
        const linkPrev = page > 1 ? `/api/alerts/my-alerts?page=${page - 1}&pageSize=${pageSize}` : null;
        const linkNext = (page - 1) * pageSize + processedAlerts.length < total ? `/api/alerts/my-alerts?page=${page + 1}&pageSize=${pageSize}` : null;

        // Tạo pages array (3 trang kế tiếp từ trang hiện tại)
        const totalPages = Math.ceil(total / pageSize);
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            if (i >= page && i < page + 3) {
                pages.push(i);
            }
        }

        return {
            total,
            page,
            pageSize,
            alerts: processedAlerts,
            linkPrev,
            linkNext,
            pages,
            unreadCount
        };

    } catch (error) {
        console.error('Error in getAlertsByUser:', error);
        throw new Error(`Lỗi khi lấy danh sách thông báo: ${error.message}`);
    }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param {String} alertId - ID thông báo
 * @param {String} userID - ID người dùng (để verify quyền)
 * @returns {Object} - Kết quả cập nhật
 */
const markAlertAsRead = async (alertId, userID) => {
    try {
        if (!alertId || !userID) {
            throw new Error('AlertId và userID là bắt buộc');
        }

        // Tìm và cập nhật thông báo
        const alert = await Alert.findOneAndUpdate(
            {
                _id: alertId,
                $or: [
                    { receiverID: userID, targetScope: 'person' }, // Thông báo cá nhân
                    { targetScope: 'all' } // Thông báo cho tất cả
                ]
            },
            {
                isRead: true,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!alert) {
            throw new Error('Không tìm thấy thông báo hoặc bạn không có quyền truy cập');
        }

        return {
            success: true,
            message: 'Đánh dấu đã đọc thành công',
            data: {
                alertId: alert._id,
                isRead: alert.isRead,
                updatedAt: alert.updatedAt
            }
        };

    } catch (error) {
        console.error('Error in markAlertAsRead:', error);
        throw new Error(`Lỗi khi đánh dấu đã đọc: ${error.message}`);
    }
};

/**
 * Xóa thông báo (chỉ admin mới được xóa thông báo all)
 * @param {String} alertId - ID thông báo
 * @param {String} userID - ID người dùng
 * @param {String} userRole - Role của người dùng (ADMIN, USER, etc.)
 * @returns {Object} - Kết quả xóa
 */
const deleteAlert = async (alertId, userID, userRole) => {
    try {
        if (!alertId || !userID) {
            throw new Error('AlertId và userID là bắt buộc');
        }

        // Tìm thông báo
        const alert = await Alert.findById(alertId);
        if (!alert) {
            throw new Error('Không tìm thấy thông báo');
        }

        // Kiểm tra quyền xóa
        if (alert.targetScope === 'all' && userRole !== 'ADMIN') {
            throw new Error('Chỉ admin mới có thể xóa thông báo hệ thống');
        }

        if (alert.targetScope === 'person' && alert.receiverID !== userID && userRole !== 'ADMIN') {
            throw new Error('Bạn không có quyền xóa thông báo này');
        }

        // Xóa thông báo
        await Alert.findByIdAndDelete(alertId);

        return {
            success: true,
            message: 'Xóa thông báo thành công',
            data: {
                alertId: alertId
            }
        };

    } catch (error) {
        console.error('Error in deleteAlert:', error);
        throw new Error(`Lỗi khi xóa thông báo: ${error.message}`);
    }
};

module.exports = {
    sendAlertToAll,
    sendAlertToPerson,
    getAlertsByUser,
    markAlertAsRead,
    deleteAlert
};