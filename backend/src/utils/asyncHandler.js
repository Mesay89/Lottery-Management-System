'use strict';

/**
 * Wraps an async Express route handler and forwards errors to next().
 * Usage: router.get('/path', asyncHandler(async (req, res, next) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
