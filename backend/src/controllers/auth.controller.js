'use strict';

const crypto = require('crypto');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { generateTokenPair, verifyRefreshToken } = require('../config/jwt');
const emailService = require('../services/email.service');
const { ERROR_MESSAGES } = require('../utils/constants');

const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password, dateOfBirth, address } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return ApiResponse.error(res, 'An account with this email already exists.', 409);
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    dateOfBirth,
    address,
    role: 'customer',
  });

  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  if (emailService.sendWelcomeEmail) {
    emailService.sendWelcomeEmail(user).catch(() => {});
  }

  return ApiResponse.created(res, {
    user,
    accessToken,
    refreshToken,
  }, 'Account registered successfully.');
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    return ApiResponse.error(res, ERROR_MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password.', 401);
  }

  if (user.isLocked && user.isLocked()) {
    return ApiResponse.error(res, 'Account is temporarily locked due to too many failed attempts.', 423);
  }

  if (user.status === 'suspended') {
    return ApiResponse.error(res, ERROR_MESSAGES.ACCOUNT_SUSPENDED || 'Account is suspended.', 403);
  }
  if (user.status === 'deactivated') {
    return ApiResponse.error(res, ERROR_MESSAGES.ACCOUNT_DEACTIVATED || 'Account is deactivated.', 403);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts = (user.loginAttempts || 0) + 1;
    if (user.loginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await user.save({ validateBeforeSave: false });
    return ApiResponse.error(res, ERROR_MESSAGES.INVALID_CREDENTIALS || 'Invalid email or password.', 401);
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLogin = new Date();

  const { accessToken, refreshToken } = generateTokenPair(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, {
    user,
    accessToken,
    refreshToken,
  }, 'Logged in successfully.');
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
  }
  return ApiResponse.success(res, null, 'Logged out successfully.');
});

const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) {
    return ApiResponse.error(res, 'Refresh token is required.', 401);
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    return ApiResponse.error(res, 'Invalid or expired refresh token.', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    return ApiResponse.error(res, 'Invalid refresh token.', 401);
  }

  if (user.status !== 'active') {
    return ApiResponse.error(res, 'Account is not active.', 403);
  }

  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return ApiResponse.success(res, tokens, 'Token refreshed.');
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return ApiResponse.success(res, null, 'If an account exists, a password reset link has been sent.');
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  if (emailService.sendPasswordResetEmail) {
    emailService.sendPasswordResetEmail(user, resetToken).catch(() => {});
  }

  return ApiResponse.success(res, null, 'If an account exists, a password reset link has been sent.');
});

const resetPassword = asyncHandler(async (req, res) => {
  const token = req.params.token || req.body.token;
  const { password } = req.body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select('+passwordResetToken +passwordResetExpires');

  if (!user) {
    return ApiResponse.error(res, 'Invalid or expired password reset token.', 400);
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined;
  await user.save();

  return ApiResponse.success(res, null, 'Password has been reset successfully.');
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return ApiResponse.error(res, 'Current password is incorrect.', 400);
  }

  user.password = newPassword;
  await user.save();

  return ApiResponse.success(res, null, 'Password updated successfully.');
});

const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, req.user, 'Profile retrieved.');
});

const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address', 'profilePhoto'];
  const updates = {};
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  return ApiResponse.success(res, user, 'Profile updated successfully.');
});

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
};
