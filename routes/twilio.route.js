// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { response } = require('../db');
const auth = require('../middleware/auth');

const twilio = require('twilio');

const accountSid = process.env.TWILIO_ID; // Tu SID de Twilio
const authToken = process.env.TWILIO_TOKEN; // Tu token de Twilio
const client = twilio(accountSid, authToken);

const fromNumber = '+14155238886'; // Tu número de WhatsApp de Twilio (en formato: 'whatsapp:+1234567890')

router.post('/recive-messages', async (req, res) => {
    try {
        console.log(JSON.stringify(req.body), "body");
        res.json(response("", "success"));
    } catch (error) {
        res.status(500).json(response('Error fetching transactions', 'error'));
    }
});

router.post('/payment-notification', (req, res) => {
    const { paymentId, amount, toNumbers } = req.body;

    const message = `Se ha recibido un pago de ${amount}. ID de pago: ${paymentId}.`;

    toNumbers.forEach(number => {
        client.messages.create({
            from: `whatsapp:${fromNumber}`,
            to: `whatsapp:${number}`,
            body: message,
        }).then(message => console.log(`Mensaje enviado a ${number}: ${message.sid}`))
            .catch(error => console.error(`Error al enviar mensaje a ${number}:`, error));
    });

    res.sendStatus(200);
});



module.exports = router;