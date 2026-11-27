'use strict';

const express = require('express');
const router = express.Router();
const drawController = require('../controllers/draw.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { scheduleDrawValidator, recordDrawResultsValidator } = require('../validators/draw.validator');

router.use(protect);

router.get('/', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), drawController.getAllDraws);
router.get('/:id', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), drawController.getDrawById);
router.post('/', authorize('superAdmin', 'lotteryAdmin'), scheduleDrawValidator, validate, auditAction('SCHEDULE', 'Draw'), drawController.scheduleDraw);
router.patch('/:id/start', authorize('superAdmin', 'lotteryAdmin'), auditAction('START', 'Draw'), drawController.startDraw);
router.post('/:id/results', authorize('superAdmin', 'lotteryAdmin'), recordDrawResultsValidator, validate, auditAction('RECORD_RESULTS', 'Draw'), drawController.recordDrawResults);
router.patch('/:id/complete', authorize('superAdmin', 'lotteryAdmin'), auditAction('COMPLETE', 'Draw'), drawController.completeDraw);
router.patch('/:id/cancel', authorize('superAdmin', 'lotteryAdmin'), auditAction('CANCEL', 'Draw'), drawController.cancelDraw);

module.exports = router;
