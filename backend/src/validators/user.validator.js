'use strict';

const { body, param } = require('express-validator');
const { ROLES, USER_STATUS } = require('../utils/constants');

const createUserValidator = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
];

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role'),
  body('status').optional().isIn(Object.values(USER_STATUS)).withMessage('Invalid status'),
];

const changeRoleValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('role').isIn(Object.values(ROLES)).withMessage('Valid role is required'),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  changeRoleValidator,
};
