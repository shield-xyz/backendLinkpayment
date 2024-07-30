const express = require('express');
const router = express.Router();
const VolumeTransactionController = require('../controllers/volumeTransactionController');
const { handleHttpError, divideByDecimals, parseCurrencyString, parsePercentageString } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const axios = require("axios");
const volumeTransactionModel = require('../models/volumeTransactionModel');
const logger = require('node-color-log');
const fs = require('fs');
const path = require('path');
const apiKeyMaster = require('../middleware/apiKeyMaster');



async function getTransactionWallet(walletAddress = process.env.WALLET_TRON_DEPOSIT, reset = false) {
    try {
        if (reset) {

            await volumeTransactionModel.deleteMany({});
        }

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
            let receivedAmount = divideByDecimals(t.value, t.token_info.decimals);
            if (isNaN(receivedAmount)) {
                continue; // Skip invalid amounts
            }

            let transaction = {
                methodPay: "Transaction",
                date: new Date(t.block_timestamp),
                receivedAmount: receivedAmount,
                symbol: t.token_info.symbol || "USDT",
                tx: t.transaction_id,
                walletSend: t.from,
            };
            if (transaction.receivedAmount > 1)
                await volumeTransactionModel.updateOne({ tx: t.transaction_id }, { $set: transaction }, { upsert: true });
        }
        console.log("Transactions inserted in volume", transactions.length);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        throw error;
    }
    setInterval(getTransactionWallet, 10 * 60 * 60 * 1000); // cada 10 hs
}

getTransactionWallet(process.env.WALLET_TRON_DEPOSIT, false).then(res => {
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

            let receivedAmount = parseCurrencyString(element['Received Amount (USD)']);
            if (isNaN(receivedAmount)) {
                continue; // Skip invalid amounts
            }

            let exist = await volumeTransactionModel.findOne({ tx: tx });
            if (exist == null || tx == null) {
                items.push({
                    client: element['Client Name'],
                    business: element['Regulatory Period'],
                    methodPay: element['Method of Pay'],
                    date: new Date(element["Date"]),
                    receivedAmount: receivedAmount,
                    receivedAmountEUR: parseCurrencyString(element['Received Amount (EUR)']),
                    totalReceived: parseCurrencyString(element['Total Received']),
                    shieldFee: parsePercentageString(element['Shield Fee']),
                    clientTransfer: parseCurrencyString(element['Client Transfer']),
                    grossProfit: parseCurrencyString(element['Gross Profit']),
                    conversionFees: parseCurrencyString(element['Conversion Fees']),
                    withdrawalFees: parseCurrencyString(element['Withdrawal Fees']),
                    gasFees: parseCurrencyString(element['Gas Fees']),
                    netProfit: parseCurrencyString(element['Net Profit']),
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
        const results = await VolumeTransactionController.getCumulativeSumByDay();
        res.json(response(results, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.get('/totalReceivedAmountByMonth', async (req, res) => {
    try {
        const results = await VolumeTransactionController.getTotalReceivedAmountByMonth();
        res.json(response(results, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});
router.get('/cumulativeSumByDay', async (req, res) => {
    try {
        const results = await VolumeTransactionController.getCumulativeSumByDay();
        res.json(response(results, 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

router.post('/', apiKeyMaster, async (req, res) => {
    try {
        const transactionData = req.body;
        transactionData.receivedAmount = parseCurrencyString(transactionData.receivedAmount);
        if (isNaN(transactionData.receivedAmount)) {
            return res.status(400).json(response('Invalid received amount', 'error'));
        }

        const transaction = await VolumeTransactionController.createTransaction(transactionData);
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

router.get('/getAdmin', apiKeyMaster, async (req, res) => {
    try {
        const transactions = await VolumeTransactionController.getAllTransactions();
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
        const transactionData = req.body;
        transactionData.receivedAmount = parseCurrencyString(transactionData.receivedAmount);
        if (isNaN(transactionData.receivedAmount)) {
            return res.status(400).json(response('Invalid received amount', 'error'));
        }

        const transaction = await VolumeTransactionController.updateTransaction({ _id: req.params.id }, transactionData);
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
