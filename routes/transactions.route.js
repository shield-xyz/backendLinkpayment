const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const transactionsController = require('../controllers/transactions.controller');

router.get(
  '/',
  auth,
  logRequest,
  transactionsController.getAllTransactions
);

router.get(
  '/ramp/get-by-current-user',
  auth,
  logRequest,
  transactionsController.getByCurrentUserFromRamp
);

router.get(
  '/get-not-synced-by-current-user',
  auth,
  logRequest,
  transactionsController.getNotSyncedByCurrentUser
);

router.post(
  '/sync-by-current-user',
  auth,
  logRequest,
  transactionsController.syncByCurrentUser
);

router.post(
  '/sync-mock-transactions-by-current-user',
  auth,
  logRequest,
  transactionsController.syncMockTransactionsByCurrentUser
);

module.exports = router;
