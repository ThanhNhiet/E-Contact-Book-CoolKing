const express = require('express');
const studentController = require('../controllers/student.controller');
const router = express.Router();

// ===== ROUTES CHO ADMIN/LECTURER =====
//GET /students/class-score-view/:course_section_id
router.get('/class-score-view/:course_section_id', studentController.getStudentsByCourseSection);

//GET /students/info-view-le-ad/:student_id
router.get('/info-view-le-ad/:student_id', studentController.getStudentInfoViewByLecturer);

// GET /students/schedule/:student_id - Lịch học với exceptions
router.get('/schedule/:student_id', studentController.getStudentScheduleWithExceptions);

// GET /students/basic-schedule/:student_id - Lịch học đơn giản
router.get('/basic-schedule/:student_id', studentController.getStudentBasicSchedule);

// GET /students/exam-schedule/:student_id - Lịch thi
router.get('/exam-schedule/:student_id', studentController.getStudentExamSchedule);

// ===== ROUTES CHO STUDENT =====
// GET /students/info-student - Thông tin cá nhân
router.get('/info-student', studentController.getStudentInfo);

// PUT /students/update-info - Cập nhật thông tin
router.put('/update-info', studentController.updateStudentInfo);

// GET /students/my-schedule - Lịch học của chính mình với exceptions
router.get('/my-schedule', studentController.getMyScheduleWithExceptions);

// GET /students/my-basic-schedule - Lịch học đơn giản của chính mình
router.get('/my-basic-schedule', studentController.getMyBasicSchedule);

// GET /students/my-exam-schedule - Lịch thi của chính mình
router.get('/my-exam-schedule', studentController.getMyExamSchedule);

module.exports = router;