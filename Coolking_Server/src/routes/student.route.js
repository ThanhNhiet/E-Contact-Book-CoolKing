const express = require('express');
const studentController = require('../controllers/student.controller');
const router = express.Router();

//GET /student/info
router.get('/info', studentController.getStudentInfo);

//PUT /student/info
router.put('/updateStudent', studentController.updateStudentInfo);


module.exports = router;