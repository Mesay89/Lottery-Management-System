'use strict';

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

/**
 * validate — Run after express-validator chains.
 * Returns 422 with error details if any validation failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field:   e.path || e.param,
      message: e.msg,
    }));
    return ApiResponse.error(res, 'Validation failed.', 422, formatted);
  }
  next();
};

module.exports = { validate };
