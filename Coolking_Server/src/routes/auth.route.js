const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// POST /public/login
router.post('/login', authController.login);

// POST /public/refresh-token
router.post('/refresh-token', authController.refreshToken);

// POST /public/logout
router.post('/logout', authController.logout);

module.exports = router;
