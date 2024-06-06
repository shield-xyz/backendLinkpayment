const express = require('express');

const validate = require('../middleware/validateTx');
const webhookController = require('../controllers/webhook.controller');
const logRequest = require('../middleware/logRequest');

const router = express.Router();

router.post('/notify', logRequest, validate, webhookController.processWebhook);

module.exports = router;
