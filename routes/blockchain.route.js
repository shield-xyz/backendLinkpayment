const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const blockchainController = require('../controllers/blockchain.controller');
const logRequest = require('../middleware/logRequest');

router.get('/', auth, logRequest, blockchainController.getAll);

module.exports = router;
