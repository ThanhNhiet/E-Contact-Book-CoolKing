const express = require('express');
const parentController = require('../controllers/parent.controller');
const router = express.Router();
const upload = require('../middlewares/upload.middleware');


// PUT /parents/update-info
router.put('/update-info', parentController.updateParentInfo);

//GET /parents/my-schedule - Lịch học của chính mình với exceptions
router.get('/my-schedule', parentController.getParentScheduleWithExceptions);


//post /parent/upload-avatar/:id - Cập nhật avatar
router.post('/upload-avatar/:id', upload.upload ,parentController.updateParentAvatar);


//GET /parent/:id (Admin mới được quyền truy cập)
router.get('/:id', parentController.getParentInfo);
module.exports = router; 
