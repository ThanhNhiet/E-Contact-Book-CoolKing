const express = require('express');
const statisticsController = require('../controllers/statistics.controller');
const router = express.Router();

// GET /api/statistics/faculty-overview?faculty_id=&session_id=
router.get('/faculty-overview', statisticsController.getFacultyOverviewStatistics);

// GET /api/statistics/lecturer-overview?lecturer_id=&session_id=
router.get('/lecturer-overview', statisticsController.getLecturerOverviewStatistics);

// GET /api/statistics/lecturers-overview?faculty_id=&session_id=
router.get('/lecturers-overview', statisticsController.getLecturersOverviewStatisticsByFaculty);

// GET /api/statistics/course-section-overview?course_section_id=&session_id=
router.get('/course-section-overview', statisticsController.getCourseSectionOverviewStatistics);

// GET /api/statistics/courses-sections-overview?faculty_id=&session_id=
router.get('/courses-sections-overview', statisticsController.getCourseSectionsOverviewStatisticsByFaculty);

module.exports = router;