const auth = require('../middleware/auth');

const express = require('express');
const router = express.Router();

const BalanceController = require('../controllers/balance.controller');
const logRequest = require('../middleware/logRequest');

router.get('/', auth, logRequest, BalanceController.getAll);
router.put('/update', auth, logRequest, BalanceController.update);
router.get(
  '/get-by-wallet-and-blockchain',
  auth,
  logRequest,
  BalanceController.getByWalletAndBlockchain
);
router.get(
  '/get-by-user/:userId',
  auth,
  logRequest,
  BalanceController.getByUser
);
router.get(
  '/get-by-current-user',
  auth,
  logRequest,
  BalanceController.getByCurrentUser
);

module.exports = router;
