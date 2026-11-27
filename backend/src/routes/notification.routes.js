'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/rbac.middleware');

router.use(protect);

router.get('/my', notificationController.getMyNotifications);
router.get('/', notificationController.getMyNotifications);
router.post('/', authorize('superAdmin', 'lotteryAdmin'), notificationController.sendNotification);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
