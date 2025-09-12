const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const router = express.Router();

//GET /schedules/:user_id?currentDate=&page=&pageSize=
router.get('/:user_id', scheduleController.getSchedulesByUserId);

module.exports = router;