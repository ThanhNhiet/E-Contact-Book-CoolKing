const express = require('express');
const authController = require('../controllers/auth.controller');
const accountController = require('../controllers/account.controller');
const router = express.Router();

// POST /public/login
router.post('/login', authController.login);

// POST /public/refresh-token
router.post('/refresh-token', authController.refreshToken);

// POST /public/logout
router.post('/logout', authController.logout);

//POST /public/verify-otp
router.post('/verify-otp', accountController.verifyOTP);

//POST /public/check-email
router.post('/check-email/:email', accountController.checkAccountByEmail);

//POST /public/change-password-by-email
router.post('/change-password-by-email', accountController.changePasswordByEmail);

module.exports = router;
