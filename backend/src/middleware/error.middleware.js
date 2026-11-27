'use strict';

const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');

/**
 * notFound — 404 handler for unmatched routes.
 */
const notFound = (req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * errorHandler — Global error handler middleware.
 * Must have 4 parameters for Express to treat it as error middleware.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message    = err.message || 'Internal Server Error';
  let errors     = null;

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = 'Validation failed.';
    errors = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // Mongoose Cast Error (bad ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token has expired.';
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} — ${err.stack || err.message}`);
  }

  return ApiResponse.error(res, message, statusCode, errors);
};

module.exports = { notFound, errorHandler };
