const express = require('express');
const courseSectionController = require('../controllers/coursesection.controller');
const router = express.Router();

// GET /coursesections/lecturer?page=&pageSize=
router.get('/lecturer', courseSectionController.getCourseSectionsByLecturer);

// GET /coursesections/lecturer/search?keyword=&page=&pageSize=
router.get('/lecturer/search', courseSectionController.searchCourseSectionsByKeyword4Lecturer);

// GET /coursesections/lecturer/filter?session=&faculty=&page=&pageSize=
router.get('/lecturer/filter', courseSectionController.filterCourseSections4Lecturer);

// GET /coursesections/:course_section_id/students-parents
router.get('/:course_section_id/students-parents', courseSectionController.getStudentsAndParentsByCourseSection);

module.exports = router;