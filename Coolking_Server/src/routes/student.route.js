const express = require('express');
const studentController = require('../controllers/student.controller');
const router = express.Router();

//GET /students/class-score-view/:course_section_id
router.get('/class-score-view/:course_section_id', studentController.getStudentsByCourseSection);

//GET /students/info-view-le-ad/:student_id
router.get('/info-view-le-ad/:student_id', studentController.getStudentInfoViewByLecturer);

module.exports = router;