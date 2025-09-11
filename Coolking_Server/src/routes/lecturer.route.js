const express = require('express');
const lecturerController = require('../controllers/lecturer.controller');
const router = express.Router();

//GET /lecturer/info
router.get('/info', lecturerController.getLecturerInfo);

//PUT /lecturer/info
router.put('/info', lecturerController.updateLecturerInfo);

module.exports = router;