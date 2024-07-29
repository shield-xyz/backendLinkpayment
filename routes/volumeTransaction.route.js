const express = require('express');
const router = express.Router();
const VolumeTransactionController = require('../controllers/volumeTransactionController');
const { handleHttpError, divideByDecimals, parseCurrencyString } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const axios = require("axios");
const volumeTransactionModel = require('../models/volumeTransactionModel');
const logger = require('node-color-log');
const fs = require('fs');
const path = require('path');
const apiKeyMaster = require('../middleware/apiKeyMaster');

async function getTransactionWallet(walletAddress = process.env.WALLET_TRON_DEPOSIT) {
    try {
        const url = `https://api.trongrid.io/v1/accounts/${walletAddress}/transactions/trc20`;
        await volumeTransactionModel.deleteMany();

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
                symbol: t.token_info.symbol || "USDT",
                tx: t.transaction_id,
                walletSend: t.from,
            };
            await volumeTransactionModel.updateOne({ tx: t.transaction_id }, { $set: transaction }, { upsert: true });
        }
        console.log("Transactions inserted in volume", transactions.length);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        throw error;
    }
    setInterval(getTransactionWallet, 10 * 60 * 60 * 1000); // cada 10 hs
}

getTransactionWallet().then(res => {
    loadTransactionsExcel();
});

async function loadTransactionsExcel() {
    logger.info("insert data excel to volumeTransactions");

    const jsonFilePath = path.resolve(__dirname, '../services/ExcelJson.json');
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    let json = JSON.parse(jsonData);
    json = json.data;

    let items = [];
    await volumeTransactionModel.deleteMany({ excelLoad: true });
    for (let i = 0; i < json.length; i++) {
        const element = json[i];
        let tx = element["Txn Hash"];

        if (element["Date"] != "" && element['Received Amount (USD)'] != "") {
            if (tx != "") {
                tx = tx.split("/").pop();
            } else {
                tx = null;
            }
            let exist = await volumeTransactionModel.findOne({ tx: tx });
            if (exist == null || tx == null) {
                items.push({
                    client: element['Client Name'],
                    business: element['Regulatory Period'],
                    methodPay: element['Method of Pay'],
                    date: new Date(element["Date"]),
                    receivedAmount: parseCurrencyString(element['Received Amount (USD)']),
                    symbol: "USDT",
                    tx: tx,
                    walletSend: element["Wallet Address"],
                    excelLoad: true
                });
            }
        }
    }
    logger.info(items.length, "excel imports");
    await volumeTransactionModel.insertMany(items);
    logger.success("insert data excel to volumeTransactions finish");
}

router.get('/totalReceivedAmountByDay', async (req, res) => {
    try {
        const results = await VolumeTransactionController.getTotalReceivedAmountByDay();
        res.json(response(results, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.post('/', apiKeyMaster, async (req, res) => {
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

router.get('/:id', apiKeyMaster, async (req, res) => {
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

router.put('/:id', apiKeyMaster, async (req, res) => {
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

router.delete('/:id', apiKeyMaster, async (req, res) => {
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
