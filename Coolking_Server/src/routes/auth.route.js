const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// POST /public/login
router.post('/login', authController.login);

// POST /public/refresh-token
router.post('/refresh-token', authController.refreshToken);

// POST /public/logout
router.post('/logout', authController.logout);

//POST /public/verify-otp-email
router.post('/verify-otp-email', authController.verifyOTP_Email);

//POST /public/check-email
router.post('/check-email/:email', authController.checkAccountByEmail);

//POST /public/change-password-by-email
router.post('/change-password-by-email', authController.changePasswordByEmail);

//POST /public/check-phone-number
router.post('/check-phone-number/:phoneNumber', authController.checkAccountByPhoneNumber);

//POST /public/verify-otp-phone
router.post('/verify-otp-phone', authController.verifyOTP_Phone);

//POST /public/change-password-by-phone
router.post('/change-password-by-phone', authController.changePasswordByPhoneNumber);

module.exports = router;
