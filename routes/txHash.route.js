const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();

const txHashController = require('../controllers/txHash.controller');
const logRequest = require('../middleware/logRequest');

router.get('/', auth, logRequest, txHashController.getAll);
router.get(
  '/get-by-blockchain',
  auth,
  logRequest,
  txHashController.getByBlockchain
);

router.delete(
  '/delete-by-blockchain',
  auth,
  logRequest,
  txHashController.deleteByBlockchain
);

module.exports = router;
