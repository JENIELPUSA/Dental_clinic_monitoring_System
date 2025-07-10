const express = require('express');
const router = express.Router();

const NotificationController = require('./../Controller/NotificationController');
const authController = require('./../Controller/authController');

// 🔒 Protected Routes
router
  .route('/')
  .post(authController.protect, NotificationController.createNotification)
  .get(authController.protect, NotificationController.DisplayNotification);

router
  .route('/:id')
  .delete(authController.protect, NotificationController.deleteNotification);

// ✅ Mark individual notification as read (using PATCH)
router
  .patch('/:id/mark-read', authController.protect, NotificationController.markAsRead);

// ✅ Fetch all notifications for a specific user (linkId)
router
  .get('/getByLink/:linkId', authController.protect, NotificationController.getByLinkId);

module.exports = router;
