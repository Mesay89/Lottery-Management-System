'use strict';

const { body, param } = require('express-validator');
const { PAYMENT_METHOD } = require('../utils/constants');

const submitClaimValidator = [
  body('winnerId').isMongoId().withMessage('Valid winner ID is required'),
  body('paymentMethod')
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage('Valid payment method is required'),
  body('claimantDetails.fullName').trim().notEmpty().withMessage('Full name is required'),
  body('claimantDetails.phone').trim().notEmpty().withMessage('Phone number is required'),
];

const rejectClaimValidator = [
  param('id').isMongoId().withMessage('Invalid claim ID'),
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required'),
];

const markPaidValidator = [
  param('id').isMongoId().withMessage('Invalid claim ID'),
  body('paymentReference').trim().notEmpty().withMessage('Payment reference is required'),
];

module.exports = {
  submitClaimValidator,
  rejectClaimValidator,
  markPaidValidator,
};
