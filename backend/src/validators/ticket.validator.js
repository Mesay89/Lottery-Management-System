'use strict';

const { body } = require('express-validator');

const registerTicketValidator = [
  body('lotteryEvent').isMongoId().withMessage('Valid lottery event ID is required'),
  body('ownerName').optional().trim().notEmpty().withMessage('Owner name cannot be empty'),
  body('ownerPhone').optional().trim().notEmpty().withMessage('Owner phone cannot be empty'),
  body('ownerEmail').optional().isEmail().withMessage('Valid email required'),
  body('purchaseChannel').optional().isIn(['online', 'agent']).withMessage('Invalid purchase channel'),
];

const verifyTicketValidator = [
  body('ticketNumber').trim().notEmpty().withMessage('Ticket number is required'),
];

module.exports = {
  registerTicketValidator,
  verifyTicketValidator,
};
