'use strict';

const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(protect);
router.use(authorize('superAdmin'));

router.get('/', auditLogController.getLogs);
router.get('/:id', auditLogController.getLogById);

module.exports = router;
