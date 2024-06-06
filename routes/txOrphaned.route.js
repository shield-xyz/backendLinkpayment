const express = require('express');
const logRequest = require('../middleware/logRequest');
const TxOrphanedController = require('../controllers/txOrphaned.controller');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', logRequest, auth, TxOrphanedController.getTxOrphaned);
router.put('/reassign', logRequest, auth, TxOrphanedController.reassignTx);

module.exports = router;
