'use strict';

const { body } = require('express-validator');
const { PAYMENT_METHOD, TRANSACTION_TYPE } = require('../utils/constants');

const createTransactionValidator = [
  body('type').optional().isIn(Object.values(TRANSACTION_TYPE)).withMessage('Invalid transaction type'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('paymentMethod').isIn(Object.values(PAYMENT_METHOD)).withMessage('Invalid payment method'),
  body('lotteryEvent').optional().isMongoId().withMessage('Invalid lottery event ID'),
  body('ticket').optional().isMongoId().withMessage('Invalid ticket ID'),
];

const initiateMobilePaymentValidator = [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least 1 ETB'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('externalRef').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 100 }).withMessage('Transaction reference must be between 3 and 100 characters'),
  body('eventId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid event ID'),
  body('ticketId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid ticket ID'),
];

module.exports = {
  createTransactionValidator,
  initiateMobilePaymentValidator,
};
