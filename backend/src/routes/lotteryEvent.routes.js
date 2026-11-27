'use strict';

const express = require('express');
const router = express.Router();
const lotteryEventController = require('../controllers/lotteryEvent.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const {
  createEventValidator,
  updateEventValidator,
  updateStatusValidator,
} = require('../validators/lotteryEvent.validator');

router.get('/public', lotteryEventController.getPublicEvents);
router.get('/', optionalAuth, lotteryEventController.getAllEvents);
router.get('/:id', optionalAuth, lotteryEventController.getEventById);
router.get('/:id/stats', protect, authorize('superAdmin', 'lotteryAdmin', 'cashManager'), lotteryEventController.getEventStats);

router.post('/', protect, authorize('superAdmin', 'lotteryAdmin'), createEventValidator, validate, auditAction('CREATE', 'LotteryEvent'), lotteryEventController.createEvent);
router.put('/:id', protect, authorize('superAdmin', 'lotteryAdmin'), updateEventValidator, validate, auditAction('UPDATE', 'LotteryEvent'), lotteryEventController.updateEvent);
router.patch('/:id/status', protect, authorize('superAdmin', 'lotteryAdmin'), updateStatusValidator, validate, auditAction('UPDATE_STATUS', 'LotteryEvent'), lotteryEventController.updateEventStatus);
router.patch('/:id/approve', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('APPROVE', 'LotteryEvent'), lotteryEventController.approveEvent);
router.patch('/:id/open', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('OPEN', 'LotteryEvent'), lotteryEventController.openEvent);
router.patch('/:id/close', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('CLOSE', 'LotteryEvent'), lotteryEventController.closeEvent);
router.patch('/:id/cancel', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('CANCEL', 'LotteryEvent'), lotteryEventController.cancelEvent);
router.delete('/:id', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('DELETE', 'LotteryEvent'), lotteryEventController.deleteEvent);

module.exports = router;
