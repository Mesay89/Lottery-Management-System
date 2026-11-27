'use strict';

const AuditLog = require('../models/AuditLog');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.action) filter.action = req.query.action;
  if (req.query.resource) filter.resource = req.query.resource;
  if (req.query.performedBy) filter.performedBy = req.query.performedBy;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort('-performedAt')
      .skip(skip)
      .limit(limit)
      .populate('performedBy', 'firstName lastName email role'),
    AuditLog.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);
  return ApiResponse.paginated(res, logs, {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  });
});

const getLogById = asyncHandler(async (req, res) => {
  const log = await AuditLog.findById(req.params.id).populate('performedBy', 'firstName lastName email role');
  if (!log) return ApiResponse.error(res, 'Audit log not found.', 404);
  return ApiResponse.success(res, log);
});

module.exports = {
  getLogs,
  getLogById,
};
