const express = require('express');
const alertController = require('../controllers/alert.controller');
const router = express.Router();

// GET /api/alerts/my-alerts?page=1&limit=10
router.get('/my-alerts', alertController.getMyAlerts);

// Đánh dấu thông báo đã đọc
router.put('/:alertId/read', alertController.markAlertAsRead);

// Xóa thông báo (user có thể xóa thông báo của mình)
router.delete('/', alertController.deleteAlert);

/**
 * ADMIN ONLY ROUTES
 */
// POST /api/alerts/send-all
router.post('/send-all', alertController.sendAlertToAll);

// GET /api/alerts/search?keyword=&page=1&pageSize=10
router.get('/search', alertController.searchAlerts);

// GET /api/alerts?page=1&pageSize=10&keyword=...
router.get('/', alertController.getAllAlerts);

/**
 * LECTURER ONLY ROUTES
 */
// POST /api/alerts/send-person
router.post('/send-person', alertController.sendAlertToPerson);

module.exports = router;