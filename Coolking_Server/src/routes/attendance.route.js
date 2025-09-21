const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const router = express.Router();

// GET /attendances/students?course_section_id=&attendance_id=
router.get('/students', attendanceController.getAttendanceDetailsByCourseSectionAndAttendanceID);

// POST /attendances/students/:attendance_id
router.post('/students/:attendance_id', attendanceController.createOrUpdateAttendanceStudents);

// PUT /attendances/students/:attendance_id
router.put('/students/:attendance_id', attendanceController.updateAttendanceStudents);

module.exports = router;
