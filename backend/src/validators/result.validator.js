'use strict';

const { body } = require('express-validator');

const createResultValidator = [
  body('lotteryEvent').isMongoId().withMessage('Valid lottery event ID is required'),
  body('draw').isMongoId().withMessage('Valid draw ID is required'),
  body('winningNumbers').optional().isArray().withMessage('Winning numbers must be an array'),
  body('prizeBreakdown').optional().isArray().withMessage('Prize breakdown must be an array'),
];

module.exports = {
  createResultValidator,
};
