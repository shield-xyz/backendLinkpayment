const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const webhookController = require('../controllers/webhook.controller');

router.post('/verify', logRequest, webhookController.verify);

module.exports = router;
