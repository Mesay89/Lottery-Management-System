'use strict';

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');
const { validate } = require('../middleware/validate.middleware');
const { auditAction } = require('../middleware/audit.middleware');
const { createUserValidator, updateUserValidator, changeRoleValidator } = require('../validators/user.validator');

router.use(protect);

router.get('/', authorize('superAdmin', 'lotteryAdmin'), userController.getAllUsers);
router.get('/:id', authorize('superAdmin', 'lotteryAdmin'), userController.getUserById);
router.post('/', authorize('superAdmin'), createUserValidator, validate, auditAction('CREATE', 'User'), userController.createUser);
router.put('/:id', authorize('superAdmin'), updateUserValidator, validate, auditAction('UPDATE', 'User'), userController.updateUser);
router.delete('/:id', authorize('superAdmin'), auditAction('DELETE', 'User'), userController.deleteUser);
router.patch('/:id/activate', authorize('superAdmin'), auditAction('ACTIVATE', 'User'), userController.activateUser);
router.patch('/:id/suspend', authorize('superAdmin'), auditAction('SUSPEND', 'User'), userController.suspendUser);
router.patch('/:id/deactivate', authorize('superAdmin'), auditAction('DEACTIVATE', 'User'), userController.deactivateUser);
router.patch('/:id/role', authorize('superAdmin'), changeRoleValidator, validate, auditAction('CHANGE_ROLE', 'User'), userController.changeUserRole);

module.exports = router;
