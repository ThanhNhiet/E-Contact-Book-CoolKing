const express = require('express');
const parentController = require('../controllers/parent.controller');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');

//GET /parent/:id (Admin mới được quyền truy cập)
router.get('/:id', parentController.getParentInfo);

//post /parent/upload-avatar/:id - Cập nhật avatar
router.post('/upload-avatar/:id', upload.upload ,parentController.updateParentAvatar);

module.exports = router; 
