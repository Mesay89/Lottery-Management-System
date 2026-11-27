'use strict';

const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');
const ApiResponse = require('../utils/apiResponse');
const { ERROR_MESSAGES } = require('../utils/constants');

/**
 * protect - Require a valid access token.
 * Attaches req.user on success.
 */
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return ApiResponse.error(res, ERROR_MESSAGES.UNAUTHENTICATED, 401);
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      const msg = err.name === 'TokenExpiredError'
        ? ERROR_MESSAGES.TOKEN_EXPIRED
        : ERROR_MESSAGES.TOKEN_INVALID;
      return ApiResponse.error(res, msg, 401);
    }

    const user = await User.findById(decoded.id).select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    if (!user) {
      return ApiResponse.error(res, ERROR_MESSAGES.UNAUTHENTICATED, 401);
    }

    if (user.status === 'suspended') {
      return ApiResponse.error(res, ERROR_MESSAGES.ACCOUNT_SUSPENDED, 403);
    }
    if (user.status === 'deactivated') {
      return ApiResponse.error(res, ERROR_MESSAGES.ACCOUNT_DEACTIVATED, 403);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * optionalAuth - Attach user if token is present; don't fail if missing.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next();

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password -refreshToken');
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch (_) {
      // ignore token errors for optional auth
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { protect, optionalAuth };
