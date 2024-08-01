const express = require('express');
const router = express.Router();
const VolumeTransactionController = require('../controllers/volumeTransactionController');
const { handleHttpError, divideByDecimals, parseCurrencyString, parsePercentageString, sendMessageMay, getPrices, sendGroupMessage } = require('../utils'); // Asumiendo que tienes un manejador de errores
const { response } = require('../db'); // Asumiendo que tienes una función de respuesta
const auth = require('../middleware/auth');
const authAdmin = require('../middleware/authAdmin');
const axios = require("axios");
const volumeTransactionModel = require('../models/volumeTransactionModel');
const logger = require('node-color-log');
const fs = require('fs');
const { Web3 } = require('web3');
const path = require('path');
const apiKeyMaster = require('../middleware/apiKeyMaster');
const { ethers } = require('hardhat');
const { Contract, } = require("ethers");
const AggregatorV3InterfaceABI = require("../services/Interface3.json");
const { getTokenTransactionsEth, getTokenTransactionsPolygon, getTokenTransactionsSolana } = require('../utils/EthereumNetworkUtils');
const { getBitcoinTransactions } = require('../utils/BitcoinNetworkUtils');
const abi = [
    "event Transfer(address indexed from, address indexed to, uint amount)"
];
const provider = new ethers.providers.JsonRpcProvider(process.env.END_POINT_TRON);
const contract = new Contract("0xA614F803B6FD780986A42C78EC9C7F77E6DED13C", AggregatorV3InterfaceABI, provider);

// contract.on(
//     "Transfer",
//     async (
//         from,
//         to,
//         value,
//         event
//     ) => {
//         // console.log(to, from, value)
//         if (to.toLowerCase() == "0xDFE0B33B515B36D640F26669CD4EE1AF514680D5".toLowerCase()) {
//             let decimals = await contract.decimals();
//             console.log(to, from, event)
//             let symbol = await contract.symbol();
//             let transaction = {
//                 methodPay: "Transaction Tron",
//                 date: Date.now(),
//                 receivedAmount: divideByDecimals(event.args.value + "", decimals),
//                 symbol: symbol,
//                 tx: event.transactionHash,
//                 walletSend: event.args.from,
//             };
//             if (transaction.receivedAmount > 0.09) {
//                 await volumeTransactionModel.updateOne({ tx: transaction.hash }, { $set: transaction }, { upsert: true });
//                 await sendGroupMessage(transaction.receivedAmount + symbol + " was received ,TX :  " + transaction.tx)
//             }
//         }
//     }
// );
async function getTransactionWalletTron(walletAddress = process.env.WALLET_TRON_DEPOSIT, reset = false) {
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
}
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

//!PENDING:
async function getTransactionValueInUSD(date) {
    try {

        // Fetch the historical price of ETH at the time of the transaction from CoinGecko
        date = date.split('T')[0];
        const ethPriceInUSD = await getEthPriceAtTimestamp(date);

        // Calculate the value in USD
        const valueInEth = Web3.utils.fromWei(transaction.value, 'ether');
        const valueInUSD = valueInEth * ethPriceInUSD;

        console.log(`Transaction Value in ETH: ${valueInEth} ETH`);
        console.log(`Transaction Value in USD: $${valueInUSD.toFixed(2)}`);

        return {
            valueInEth,
            valueInUSD
        };
    } catch (error) {
        console.error('Error fetching transaction value:', error);
    }
}



async function getTransactions(wallet = "0x62c74109d073d5bd3cf6b4e6a91a77c3d4cf310a") {

    await volumeTransactionModel.deleteMany({});
    console.log("start get transactions")
    try {
        getTokenTransactionsEth(wallet).then(async res => {
            for (let i = 0; i < res.transfers.length; i++) {
                const element = res.transfers[i];
                let transaction = {
                    methodPay: "Transaction",
                    date: new Date(element.metadata.blockTimestamp),
                    receivedAmount: divideByDecimals(element.value + "", parseInt(element.rawContract.decimal, 16)),
                    symbol: element.asset || "USDT",
                    tx: element.hash,
                    walletSend: element.from,
                };
                if (transaction.receivedAmount > 1)
                    await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
            }
            logger.info("eth transactions from " + wallet + " inserted")
        })
    } catch (error) {
        console.log(error.message, "error eth")
    }
    try {
        getTokenTransactionsPolygon(wallet).then(async res => {
            let tokens = [process.env.POLYGON_USDT.toLowerCase(), process.env.POLYGON_USDC.toLowerCase()]
            for (let i = 0; i < res.transfers.length; i++) {
                const element = res.transfers[i];
                if (element.value != null && tokens.includes(element?.rawContract?.address.toLowerCase())) {
                    console.log(element)

                    let transaction = {
                        methodPay: "Transaction",
                        date: new Date(element.metadata.blockTimestamp),
                        receivedAmount: divideByDecimals(element.value + "", parseInt(element.rawContract.decimal, 16)),
                        symbol: element.asset || "USDT",
                        tx: element.hash,
                        walletSend: element.from,
                    };
                    if (transaction.receivedAmount > 1)
                        await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
                }
            }
            logger.info("POLYGON transactions from " + wallet + " inserted")
        })
    } catch (error) {
        console.log(error.message, "error polygon")
    }

    let solanaWallet = "jNDK3f71jgZdQLysYsdU5sXfBxwEQSDWfmJNLrhGVAk";
    const tokenMints = [
        'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
        'FCqfQfr7chiC9bSG3zKSm8AsM9XuK5v6KEsNfGpP73rE'  // USDC
    ];
    try {
        getTokenTransactionsSolana(solanaWallet).then(async transactions => {

            const receivedTokens = [];

            transactions.forEach(transaction => {
                transaction.meta.postTokenBalances.forEach(async balance => {
                    if (balance.owner === solanaWallet && tokenMints.includes(balance.mint)) {
                        const preBalance = transaction.meta.preTokenBalances.find(b => b.accountIndex === balance.accountIndex) || { uiTokenAmount: { amount: 0 } };
                        const receivedAmount = parseFloat(balance.uiTokenAmount.amount) - parseFloat(preBalance.uiTokenAmount.amount);
                        if (receivedAmount > 0) {
                            let t = {
                                methodPay: "Transaction solana",
                                date: new Date(transaction.blockTime * 1000),
                                receivedAmount: receivedAmount / (10 ** balance.uiTokenAmount.decimals),
                                symbol: "USDT",
                                tx: transaction.transaction?.signatures[0]?.publicKey.toString(),
                                walletSend: (transaction.transaction._message.accountKeys.find(acc => acc !== solanaWallet)).toString()
                            };
                            if (t.receivedAmount > 1)
                                await volumeTransactionModel.updateOne({ tx: t.tx }, { $set: t }, { upsert: true });
                        }
                    }
                });
            });
            logger.info("solana transactions from " + solanaWallet + " inserted")

        })
    } catch (error) {
        console.log(error.message, "error solana")
    }

    try {
        await getTransactionWalletTron();

    } catch (error) {
        console.log(error.message, "error tron")

    }

    try {
        let prices = await getPrices();
        let btc = "32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L";
        getBitcoinTransactions(btc).then(transactions => {
            // console.log(transactions)
            transactions?.forEach(async tx => {
                // console.log(tx);
                tx.out.forEach(async output => {
                    if (output.addr === btc) {
                        // console.log(`Received Amount: ${output.value / 100000000} BTC`);
                        let t = {
                            methodPay: "Transaction Bitcoin",
                            date: new Date(tx.time),
                            receivedAmount: (output.value / 100000000) * prices.BTCUSDT,
                            symbol: "BTC",
                            tx: tx.hash,
                            walletSend: output.addr
                        };
                        if (t.receivedAmount > 1)
                            await volumeTransactionModel.updateOne({ tx: t.tx }, { $set: t }, { upsert: true });
                    }
                });
            });
        });
        logger.info("BTC transactions from " + btc + " inserted")
        console.log("finish get transactions")
    } catch (error) {
        console.log(error.message, "error btc")

    }



    setInterval(getTransactions, 10 * 60 * 60 * 1000); // cada 10 hs
}

getTransactions();





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
