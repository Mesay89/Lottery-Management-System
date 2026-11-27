'use strict';

const Notification = require('../models/Notification');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const notificationService = require('../services/notification.service');

const sendNotification = asyncHandler(async (req, res) => {
  const { recipient, title, message, type, data } = req.body;
  const notification = await notificationService.createInAppNotification(recipient, title, message, data);
  return ApiResponse.created(res, notification, 'Notification sent.');
});

const getMyNotifications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id }).sort('-createdAt').skip(skip).limit(limit),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, status: { $ne: 'Read' } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  return res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: { total, page, limit, totalPages },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { status: 'Read', readAt: new Date() },
    { new: true }
  );
  if (!notification) return ApiResponse.error(res, 'Notification not found.', 404);
  return ApiResponse.success(res, notification, 'Marked as read.');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, status: { $ne: 'Read' } },
    { status: 'Read', readAt: new Date() }
  );
  return ApiResponse.success(res, null, 'All notifications marked as read.');
});

module.exports = {
  sendNotification,
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};
