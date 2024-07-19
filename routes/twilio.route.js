// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { response } = require('../db');
const auth = require('../middleware/auth');

const logger = require('node-color-log');
const { sendMessageTwilio } = require('../utils');

const accountSid = process.env.TWILIO_ID; // Tu SID de Twilio
const authToken = process.env.TWILIO_TOKEN; // Tu token de Twilio

router.all('/recive-messages', async (req, res) => {
    try {
        console.log(JSON.stringify(req), "body");
        res.json(response("", "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching transactions', 'error'));
    }
});

router.post('/payment-notification', async (req, res) => {
    try {
        const { paymentId, amount, number } = req.body;

        let resp = await sendMessageTwilio(number, amount);
        logger.info(resp);
        res.status(200).json(response('Mensaje enviado', 'success'));
    } catch (error) {
        console.error('Error al enviar el mensaje:', error);
        res.status(500).json(response('Error al enviar el mensaje', 'error'));
    }
});

module.exports = router;
