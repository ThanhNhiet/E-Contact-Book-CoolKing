const express = require('express');
const alertController = require('../controllers/alert.controller');
const router = express.Router();

// GET /api/alerts/my-alerts?page=1&limit=10
router.get('/my-alerts', alertController.getMyAlerts);

// Lấy số lượng thông báo chưa đọc
router.get('/unread-count', alertController.getUnreadCount);

// Đánh dấu thông báo đã đọc
router.put('/:alertId/read', alertController.markAlertAsRead);

// Xóa thông báo (user có thể xóa thông báo của mình)
router.delete('/:alertId', alertController.deleteAlert);

/**
 * ADMIN ONLY ROUTES
 */
// POST /api/alerts/send-all
router.post('/send-all', alertController.sendAlertToAll);

/**
 * LECTURER ONLY ROUTES
 */
// POST /api/alerts/send-person
router.post('/send-person', alertController.sendAlertToPerson);

// GET /api/alerts/user/:userID
router.get('/user/:userID', alertController.getUserAlerts);

module.exports = router;