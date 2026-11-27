'use strict';

const AuditLog = require('../models/AuditLog');

/**
 * auditAction(action, resource) — Middleware factory.
 * Logs the action to AuditLog after the response is sent.
 *
 * Usage: router.post('/path', protect, auditAction('CREATE', 'LotteryEvent'), controller)
 */
const auditAction = (action, resource) => async (req, res, next) => {
  // Capture original json method to intercept the response
  const originalJson = res.json.bind(res);

  res.json = async (body) => {
    // Restore and send the response first
    res.json = originalJson;
    originalJson(body);

    // Only log on successful mutating operations (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const resourceId =
          req.params.id ||
          req.params.eventId ||
          req.params.ticketId ||
          (body && body.data && body.data._id) ||
          null;

        await AuditLog.create({
          action,
          resource,
          resourceId: resourceId ? String(resourceId) : undefined,
          performedBy: req.user ? req.user._id : undefined,
          ipAddress:  req.ip || req.connection?.remoteAddress,
          userAgent:  req.headers['user-agent'],
          description: `${action} on ${resource}${resourceId ? ' (' + resourceId + ')' : ''}`,
          changes: req.body || {},
        });
      } catch (err) {
        // Never let audit failure crash the request
        console.error('Audit log error:', err.message);
      }
    }
  };

  next();
};

module.exports = { auditAction };
