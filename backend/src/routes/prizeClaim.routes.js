'use strict';

const express = require('express');
const router = express.Router();
const prizeClaimController = require('../controllers/prizeClaim.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { submitClaimValidator, rejectClaimValidator, markPaidValidator } = require('../validators/prizeClaim.validator');

router.use(protect);

router.post('/', submitClaimValidator, validate, auditAction('SUBMIT', 'PrizeClaim'), prizeClaimController.submitClaim);
router.get('/my', prizeClaimController.getMyClaims);
router.get('/', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), prizeClaimController.getAllClaims);
router.get('/:id', prizeClaimController.getClaimById);
router.patch('/:id/review', authorize('superAdmin', 'cashManager'), auditAction('REVIEW', 'PrizeClaim'), prizeClaimController.reviewClaim);
router.patch('/:id/approve', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), auditAction('APPROVE', 'PrizeClaim'), prizeClaimController.approveClaim);
router.patch('/:id/reject', authorize('superAdmin', 'lotteryAdmin', 'cashManager'), rejectClaimValidator, validate, auditAction('REJECT', 'PrizeClaim'), prizeClaimController.rejectClaim);
router.patch('/:id/paid', authorize('superAdmin', 'cashManager'), markPaidValidator, validate, auditAction('PAID', 'PrizeClaim'), prizeClaimController.markAsPaid);

module.exports = router;
