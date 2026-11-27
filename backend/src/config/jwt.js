'use strict';

const jwt = require('jsonwebtoken');

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || 'fallback_access_secret_change_in_prod';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_in_prod';
const ACCESS_EXPIRE  = process.env.JWT_ACCESS_EXPIRE  || '15m';
const REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';

/**
 * Generate a signed access token.
 * @param {Object} payload - { id, role }
 * @returns {string}
 */
const generateAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRE });

/**
 * Generate a signed refresh token.
 * @param {Object} payload - { id }
 * @returns {string}
 */
const generateRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRE });

/**
 * Verify an access token.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyAccessToken = (token) =>
  jwt.verify(token, ACCESS_SECRET);

/**
 * Verify a refresh token.
 * @param {string} token
 * @returns {Object} decoded payload
 */
const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET);

/**
 * Generate both access and refresh tokens for a user.
 * @param {Object} user - Mongoose user document
 * @returns {{ accessToken, refreshToken }}
 */
const generateTokenPair = (user) => ({
  accessToken:  generateAccessToken({ id: user._id, role: user.role }),
  refreshToken: generateRefreshToken({ id: user._id }),
});

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  ACCESS_EXPIRE,
  REFRESH_EXPIRE,
};
