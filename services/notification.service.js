// services/notification.service.js
const db = require("../../config/db");

const createNotification = async (userId, title, message, type = 'system') => {
    try {
        await db.query(
            "INSERT INTO notifications (user_id, title, message, type) VALUES ($1, $2, $3, $4)",
            [userId, title, message, type]
        );
    } catch (err) {
        console.error("Notification Error:", err.message);
    }
};

module.exports = { createNotification };