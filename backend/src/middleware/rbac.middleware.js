'use strict';

const ApiResponse = require('../utils/apiResponse');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * authorize(...roles) — Middleware factory for role-based access control.
 * Must be used AFTER the protect middleware.
 *
 * Usage: authorize('superAdmin', 'lotteryAdmin')
 */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, ERROR_MESSAGES.UNAUTHENTICATED, 401);
  }
  if (!roles.includes(req.user.role)) {
    return ApiResponse.error(res, ERROR_MESSAGES.UNAUTHORIZED, 403);
  }
  next();
};

module.exports = { authorize };
