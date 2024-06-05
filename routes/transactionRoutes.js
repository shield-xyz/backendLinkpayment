// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const transactionService = require('../services/transactionService');

router.get('/', async (req, res) => {
    const transactions = await transactionService.getTransactions();
    res.json(transactions);
});

router.get('/:id', async (req, res) => {
    const transaction = await transactionService.getTransactionById(req.params.id);
    res.json(transaction);
});

router.post('/', async (req, res) => {
    const newTransaction = await transactionService.createTransaction(req.body);
    res.json(newTransaction);
});

router.put('/:id', async (req, res) => {
    // const updatedTransaction = await transactionService.updateTransaction(req.params.id, req.body);
    // res.json(updatedTransaction);
});

router.delete('/:id', async (req, res) => {
    // await transactionService.deleteTransaction(req.params.id);
    // res.json({ message: 'Transaction deleted' });
});

module.exports = router;
