'use strict';

const { body, param } = require('express-validator');
const { EVENT_STATUS } = require('../utils/constants');

const createEventValidator = [
  body('name').trim().notEmpty().withMessage('Event name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('ticketPrice').isFloat({ min: 0 }).withMessage('Ticket price must be a non-negative number'),
  body('totalTickets').isInt({ min: 1 }).withMessage('Total tickets must be at least 1'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('closingDate').isISO8601().withMessage('Valid closing date is required'),
  body('drawDate').isISO8601().withMessage('Valid draw date is required'),
  body('minimumAge').optional().isInt({ min: 18 }).withMessage('Minimum age must be at least 18'),
  body('prizeStructure').optional().isArray().withMessage('Prize structure must be an array'),
];

const updateEventValidator = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('name').optional().trim().notEmpty().withMessage('Event name cannot be empty'),
  body('ticketPrice').optional().isFloat({ min: 0 }).withMessage('Invalid ticket price'),
  body('totalTickets').optional().isInt({ min: 1 }).withMessage('Total tickets must be at least 1'),
];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid event ID'),
  body('status').isIn(Object.values(EVENT_STATUS)).withMessage('Invalid event status'),
];

module.exports = {
  createEventValidator,
  updateEventValidator,
  updateStatusValidator,
};
