const express = require('express');
const router = express.Router();
const NotificationsController = require('../controllers/NotificationsUser.controller');
const { response } = require('../utils');
const auth = require('../middleware/auth');
const { NOTIFICATIONS } = require('../config');



router.get('/', auth, async (req, res) => {
    try {
        const notifications = await NotificationsController.getNotifications({ userId: req.user._id });
        res.status(200).json(response(notifications, 'success'));
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const notification = await NotificationsController.getOne({ _id: req.params.id, user: req.user._id });
        if (notification) {
            res.status(200).json(response(notification, 'success'));
        } else {
            res.status(200).json(response('Notification not found', 'error'));
        }
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        let { status } = req.body;
        const notification = await NotificationsController.updateNotification(req.params.id, { status: status });
        if (notification) {
            res.status(200).json(response(notification, 'success'));
        } else {
            res.status(200).json(response('Notification not found', 'error'));
        }
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});

// router.delete('/:id', async (req, res) => {
//     try {
//         const notification = await NotificationsController.deleteNotification(req.params.id);
//         if (notification) {
//             res.status(200).json(response('Notification deleted', 'success'));
//         } else {
//             res.status(200).json(response('Notification not found', 'error'));
//         }
//     } catch (error) {
//         res.status(200).json(response(error.message, 'error'));
//     }
// });

module.exports = router;
