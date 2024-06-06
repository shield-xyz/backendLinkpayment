const auth = require('../middleware/auth');
const logRequest = require('../middleware/logRequest');

const express = require('express');
const router = express.Router();

const walletController = require('../controllers/wallet.controller');

router.post('/create', auth, logRequest, walletController.create);
router.put('/update', auth, logRequest, walletController.updateWallet);
router.post('/create-for-current-user', auth, walletController.create);
router.get('/price', auth, logRequest, walletController.getTokenPrice);
router.get(
  '/historical-price',
  auth,
  logRequest,
  walletController.getHistoricalPrice
);
router.get('/shield', auth, logRequest, walletController.shield);
router.get('/', auth, logRequest, walletController.getAll);
router.get(
  '/get-by-blockchain/:blockchain',
  auth,
  walletController.getWalletByBlockchain
);
router.get(
  '/get-by-user/:userId',
  auth,
  logRequest,
  walletController.getWalletByUser
);
router.get(
  '/get-by-current-user',
  auth,
  logRequest,
  walletController.getWalletByCurrentUser
);
router.get('/:address', auth, logRequest, walletController.getWalletByAddress);
router.put(
  '/:address',
  auth,
  logRequest,
  walletController.updateBalanceByAddress
);

module.exports = router;
