const express = require('express');
const router = express.Router();
const NotificationsController = require('../controllers/NotificationsUser.controller');
const { response, sendGroupMessage, sendMessageMay } = require('../utils');
const auth = require('../middleware/auth');
const { NOTIFICATIONS } = require('../config');
const { sendGeneralEmail } = require('../controllers/email.controller');
const axios = require("axios")


router.get('/', auth, async (req, res) => {
    try {
        const notifications = await NotificationsController.getNotifications({ userId: req.user._id, status: { $nin: ["deleted"] } });
        res.status(200).json(response(notifications, 'success'));
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});

router.get('/:id', auth, async (req, res) => {
    try {
        const notification = await NotificationsController.getOne({ _id: req.params.id, user: req.user._id, status: { $nin: ["deleted"] } });
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

router.post('/', auth, async (req, res) => {
    try {
        req.body.userId = req.user._id;
        const notification = await NotificationsController.createNotification(req.body);
        if (notification) {
            res.status(200).json(response(notification, 'success'));
        } else {
            res.status(200).json(response('Notification not found', 'error'));
        }
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});

// Función para enviar un mensaje a ChatGPT
const enviarMensajeAChatGPT = async (mensaje) => {
    const apiKey = process.env.OPEN_AI_KEY;
    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
    };
    const data = {
        model: 'gpt-4',
        messages: [
            { role: 'system', content: "Quiero que respondas en ingles, si dicen que esta una cantidad ready respondas algo como hello sir, send to same wallet : TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd, si es otra cosa responde 'not found' " },
            { role: 'user', content: mensaje }],
        max_tokens: 150
    };

    try {
        const response = await axios.post(endpoint, data, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('Error al enviar el mensaje a ChatGPT:', error);
        return "Not found";
    }
};
router.post('/webhook-wpp', async (req, res) => {

    console.log(req.body, "wpp - notification");
    if (req.body?.message?.text && req.body?.type == "message") {

        let ia = await enviarMensajeAChatGPT(req.body.message.text);
        console.log(ia);
        if (!ia.toLowerCase().includes("found")) {
            sendMessageMay(req.body.user.id, ia);
        }
    }
    return res.status(200).json({ response: {}, status: "success" })
});


router.post('/send-whatsapp', async (req, res) => {
    try {
        const { message, number, groupId } = req.body;
        let resp = {};
        if (groupId != undefined) {
            resp = await sendGroupMessage(message);
        } else {
            resp = await sendMessageMay(number, message);
        }
        res.status(200).json(response(resp, 'success'));
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json(response('Error al enviar el mensaje', 'error'));
    }
});
router.post('/send-email', async (req, res) => {
    try {
        const { to, title, message, components } = req.body;
        await sendGeneralEmail(to, title, message, components)
        res.status(200).json(response("email sent", 'success'));
    } catch (error) {
        console.error('Error al enviar el email:', error);
        res.status(500).json(response('Error to send email', 'error'));
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
