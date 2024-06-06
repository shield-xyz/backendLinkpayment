const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const cardController = require('../controllers/cards.controller');
const logRequest = require('../middleware/logRequest');

router.get('/', auth, logRequest, cardController.findCardsFromAirtable);
router.get('/ramp', auth, logRequest, cardController.findCardsFromRamp);

module.exports = router;
