const express = require('express');
const router = express.Router();
const VolumeTransactionController = require('../controllers/volumeTransactionController');
const { handleHttpError, divideByDecimals } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const axios = require("axios");
const volumeTransactionModel = require('../models/volumeTransactionModel');

async function getTransactionWallet(walletAddress = process.env.WALLET_TRON_DEPOSIT) {
    try {
        const url = `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20`;

        const response = await axios.get(url, {
            headers: {
                'TRON-PRO-API-KEY': process.env.TRON_API_KEY
            },
            params: {
                limit: 200,
                only_to: true
            }
        });

        const transactions = response.data.data.filter(tx => tx.to === walletAddress);
        for (let i = 0; i < transactions.length; i++) {
            const t = transactions[i];
            let transaction = {
                methodPay: "Transaction",
                date: new Date(t.block_timestamp),
                receivedAmount: divideByDecimals(t.value, t.token_info.decimals),
                symbol: t.token_info.symbol,
                tx: t.transaction_id,
                walletSend: t.from,
            }
            await volumeTransactionModel.updateOne({ tx: t.transaction_id }, { $set: transaction }, { upsert: true });
        }
        console.log("Transactions inserted in volume", transactions.length);

    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        throw error;
    }

    setInterval(getTransactionWallet, 10 * 60 * 60 * 1000);//cada 10 hs
}

getTransactionWallet();
router.get('/totalReceivedAmountByDay', async (req, res) => {
    try {
        const results = await VolumeTransactionController.getTotalReceivedAmountByDay();
        res.json(response(results, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.post('/', authAdmin, async (req, res) => {
    try {
        const transaction = await VolumeTransactionController.createTransaction(req.body);
        res.json(response(transaction, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/', async (req, res) => {
    try {
        const transactions = await VolumeTransactionController.getTransactions();
        res.json(response(transactions, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const transaction = await VolumeTransactionController.getTransactionById(req.params.id);
        if (!transaction) {
            return res.status(404).json(response('Transaction not found', 'error'));
        }
        res.json(response(transaction, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.put('/:id', authAdmin, async (req, res) => {
    try {
        const transaction = await VolumeTransactionController.updateTransaction({ _id: req.params.id }, req.body);
        if (!transaction) {
            return res.status(404).json(response('Transaction not found', 'error'));
        }
        res.json(response(transaction, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.delete('/:id', authAdmin, async (req, res) => {
    try {
        const transaction = await VolumeTransactionController.deleteTransaction({ _id: req.params.id });
        if (!transaction) {
            return res.status(404).json(response('Transaction not found', 'error'));
        }
        res.json(response('Transaction deleted', 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

module.exports = router;
