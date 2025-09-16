const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const router = express.Router();

//GET /schedules/by-user?currentDate=
router.get('/by-user', scheduleController.getSchedulesByUserId);

module.exports = router;