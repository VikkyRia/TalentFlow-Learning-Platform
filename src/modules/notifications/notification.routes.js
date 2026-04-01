const express = require("express");
const router = express.Router();
const notificationController = require("./notification.controller");
const { protect } = require("../../middlewares/auth.middleware"); // Using your partner's middleware

/**
 * @route   GET /api/notifications
 * @desc    Get all notifications for the logged-in user
 * @access  Private
 */
router.get("/", protect, notificationController.getUserNotifications);

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Mark a specific notification as read
 * @access  Private
 */
router.patch("/:id/read", protect, notificationController.markAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification
 * @access  Private
 */
router.delete("/:id", protect, notificationController.deleteNotification);

module.exports = router;