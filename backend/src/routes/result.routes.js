'use strict';

const express = require('express');
const router = express.Router();
const resultController = require('../controllers/result.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { createResultValidator } = require('../validators/result.validator');

router.get('/', optionalAuth, resultController.getAllResults);
router.get('/event/:eventId', optionalAuth, resultController.getResultByEvent);
router.get('/:id', optionalAuth, resultController.getResultById);

router.post('/', protect, authorize('superAdmin', 'lotteryAdmin'), createResultValidator, validate, auditAction('CREATE', 'Result'), resultController.createResult);
router.post('/:id/publish', protect, authorize('superAdmin', 'lotteryAdmin'), auditAction('PUBLISH', 'Result'), resultController.publishResult);

module.exports = router;
