'use strict';

const { body, param } = require('express-validator');

const createPrizeValidator = [
  body('lotteryEvent').isMongoId().withMessage('Valid lottery event ID is required'),
  body('rank').isInt({ min: 1 }).withMessage('Rank must be a positive integer'),
  body('name').trim().notEmpty().withMessage('Prize name is required'),
  body('prizeType').optional().isIn(['cash', 'item', 'voucher']).withMessage('Invalid prize type'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

const updatePrizeValidator = [
  param('id').isMongoId().withMessage('Invalid prize ID'),
  body('name').optional().trim().notEmpty().withMessage('Prize name cannot be empty'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be non-negative'),
];

module.exports = {
  createPrizeValidator,
  updatePrizeValidator,
};
