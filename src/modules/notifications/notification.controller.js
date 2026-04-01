const db = require("../../config/db");
const { success, error } = require("../../utils/response");

exports.getUserNotifications = async (req, res) => {
    try {
        // Raw SQL for Notifications
        const result = await db.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", 
            [req.user.id] // req.user.id is now a UUID string
        );

        return success(res, "Notifications fetched", { notifications: result.rows });
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const result = await db.query(
            "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *",
            [req.params.id, req.user.id]
        );

        if (result.rowCount === 0) {
            return error(res, "Notification not found", 404);
        }

        return success(res, "Notification marked as read", result.rows[0]);
    } catch (err) {
        return error(res, err.message, 500);
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id; 

        const notification = await Notification.findOne({
            where: { id: notificationId, userId: userId }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found or unauthorized",
                data: null
            });
        }

        await notification.destroy();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
            data: null
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: null
        });
    }
};