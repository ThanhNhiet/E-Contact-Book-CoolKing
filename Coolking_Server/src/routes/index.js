const express = require('express');
const accountRoute = require('./account.route');
const authRoute = require('./auth.route');
const lecturerRoute = require('./lecturer.route');
const scheduleRoute = require('./schedule.route');

const router = express.Router();

router.use('/accounts', accountRoute);
router.use('/public', authRoute);
router.use('/lecturer', lecturerRoute);
router.use('/schedules', scheduleRoute);

module.exports = router;
