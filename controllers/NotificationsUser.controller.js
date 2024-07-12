const NotificationsUser = require('../models/NotificationsUser.model');

const createNotification = async (data) => {
    try {
        const notification = new NotificationsUser(data);
        await notification.save();
        return notification;
    } catch (error) {
        return error.message;
    }
};

const getNotifications = async (filter = {}) => {
    try {
        return await NotificationsUser.find(filter).sort({ status: 1, createdAt: 1 });
    } catch (error) {
        return error.message;
    }
};

const getNotificationById = async (id) => {
    try {
        return await NotificationsUser.findById(id).populate('user');
    } catch (error) {
        return error.message;
    }
};
const getOne = async (filter) => {
    try {
        return await NotificationsUser.findOne(filter).populate('user');
    } catch (error) {
        return error.message;
    }
};

const updateNotification = async (id, data) => {
    try {
        return await NotificationsUser.findByIdAndUpdate(id, data, { new: true });
    } catch (error) {
        return error.message;
    }
};

const deleteNotification = async (id) => {
    try {
        return await NotificationsUser.findByIdAndDelete(id);
    } catch (error) {
        return error.message;
    }
};

module.exports = {
    createNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getOne
};
