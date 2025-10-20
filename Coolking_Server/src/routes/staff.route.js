const express = require('express');
const staffController = require('../controllers/staff.controller');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

//GET /api/staffs/admin/info
router.get('/admin/info', staffController.getStaffAdminInfo);

//POST /api/staffs/add-admin-id/:staff_id?adminid=<admin_id>&position=<position>
router.post('/add-admin-id/:staff_id', staffController.addAdminId4Staff);

//PUT /api/staffs/admin
router.put('/admin', staffController.updateStaffAdminInfo);

//DELETE /api/staffs/:id
router.delete('/:id', staffController.deleteStaff);

// GET /api/staffs/:id (Admin mới được quyền truy cập)
router.get('/:id', staffController.getStaffById);

// PUT /api/staffs/admin/upload-avatar
router.put('/admin/upload-avatar', upload.upload, staffController.uploadAvatarStaffAdmin);

module.exports = router;