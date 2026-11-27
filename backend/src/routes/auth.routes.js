'use strict';

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
} = require('../validators/auth.validator');

router.post('/register', registerValidator, validate, auditAction('REGISTER', 'User'), authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', protect, authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidator, validate, authController.resetPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.post('/change-password', protect, changePasswordValidator, validate, authController.changePassword);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, auditAction('UPDATE_PROFILE', 'User'), authController.updateProfile);

module.exports = router;
