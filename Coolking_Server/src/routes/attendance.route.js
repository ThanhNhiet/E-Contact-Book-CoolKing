const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const router = express.Router();

// GET /attendances/students/:course_section_id
router.get('/students/:course_section_id', attendanceController.getAttendanceDetailsByCourseSectionAndAttendanceID);

// POST /attendances/students/:course_section_id
router.post('/students/:course_section_id', attendanceController.createAttendanceStudents);

// PUT /attendances/students/:attendance_id
router.put('/students/:attendance_id', attendanceController.updateAttendanceStudents);

module.exports = router;
