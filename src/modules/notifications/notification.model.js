const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 


const Notification = sequelize.define('Notification', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // This will link to User ID
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    type: {
        type: DataTypes.ENUM('assignment', 'enrollment', 'system', 'auth'),
        defaultValue: 'system'
    }
}, {
    timestamps: true
});

module.exports = Notification;