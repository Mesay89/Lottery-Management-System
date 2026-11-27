'use strict';

const { body, param } = require('express-validator');

const scheduleDrawValidator = [
  body('lotteryEvent').isMongoId().withMessage('Valid lottery event ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('drawMethod').optional().isIn(['manual', 'random', 'hybrid']).withMessage('Invalid draw method'),
];

const recordDrawResultsValidator = [
  param('id').isMongoId().withMessage('Invalid draw ID'),
  body('winningNumbers').optional().isArray().withMessage('Winning numbers must be an array'),
  body('winningTickets').optional().isArray().withMessage('Winning tickets must be an array'),
];

module.exports = {
  scheduleDrawValidator,
  recordDrawResultsValidator,
};
