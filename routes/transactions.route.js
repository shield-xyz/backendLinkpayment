// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactions.controller');
const { response } = require('../db');
const auth = require('../middleware/auth');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const { getPrices } = require('../utils');
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await transactionController.getTransactions({ userId: req.user._id });
    const prices = await getPrices();
    transactions.map(x => {
      x.usdValue = x.amount;
      if (x.assetId == "btc-bitcoin") {
        x.usdValue = x.usdValue * prices?.BTCUSDT ?? 1;
      }
      return x;
    })
    res.json(response(transactions, "success"));
  } catch (error) {
    res.status(500).json(response('Error fetching transactions', 'error'));
  }
});

router.get('/admin/', apiKeyMaster, async (req, res) => {
  try {
    const transactions = await transactionController.getTransactions();
    res.json(response(transactions, "success"));
  } catch (error) {
    res.status(500).json(response('Error fetching transactions', 'error'));
  }
});

// router.get('/:id', async (req, res) => {
//   try {
//     const transaction = await transactionController.getTransactionById(req.params.id);
//     res.json(response(transaction, "success"));
//   } catch (error) {
//     res.status(500).json(response('Error fetching transaction', 'error'));
//   }
// });

// router.post('/', async (req, res) => {
//   try {
//     const newTransaction = await transactionController.createTransaction(req.body);
//     res.json(response(newTransaction, "success"));
//   } catch (error) {
//     res.status(500).json(response('Error creating transaction', 'error'));
//   }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const updatedTransaction = await transactionController.updateTransaction(req.params.id, req.body);
//     res.json(response(updatedTransaction, "success"));
//   } catch (error) {
//     res.status(500).json(response('Error updating transaction', 'error'));
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     await transactionController.deleteTransaction(req.params.id);
//     res.json(response('Transaction deleted', "success"));
//   } catch (error) {
//     res.status(500).json(response('Error deleting transaction', 'error'));
//   }
// });

module.exports = router;