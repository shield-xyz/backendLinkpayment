const express = require('express');
const router = express.Router();
const VolumeTransactionController = require('../controllers/volumeTransactionController');
const { handleHttpError, divideByDecimals, parseCurrencyString, parsePercentageString, sendMessageMay, getPrices, sendGroupMessage, formatCurrency, removeCeros } = require('../utils'); // Asumiendo que tienes un manejador de errores
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
const EmailController = require('../controllers/email.controller');
const ERC20 = require("../services/ERC20.json")
const provider = new ethers.providers.JsonRpcProvider(process.env.END_POINT_TRON);
const contract = new Contract("0xA614F803B6FD780986A42C78EC9C7F77E6DED13C", AggregatorV3InterfaceABI, provider);
const { Alchemy, AlchemyProvider, Network } = require('@alch/alchemy-sdk');
const WebSocket = require('ws');
const AlchemyWebHookResponseModel = require('../models/AlchemyWebHookResponse');
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
contract.on(
    "Transfer",
    async (
        from,
        to,
        value,
        event
    ) => {
        if (to.toLowerCase() == "0xDFE0B33B515B36D640F26669CD4EE1AF514680D5".toLowerCase()) {
            let decimals = await contract.decimals();
            console.log(to, from, event)
            let symbol = await contract.symbol();
            let transaction = {
                date: Date.now(),
                receivedAmount: divideByDecimals(event.args.value + "", decimals),
                shieldFee: 0,
                symbol: symbol,
                tx: event.transactionHash,
                walletSend: event.args.from,
            };
            if (transaction.receivedAmount > 0.09) {
                await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
                await sendGroupMessage(transaction.receivedAmount + symbol + " was received ,TX :  " + transaction.tx)
                EmailController.sendPaymentReceivedPaymentEmail(process.env.EMAIL_NOTIFICATIONS, "https://tronscan.org/#/transaction/" + transaction.tx, transaction.receivedAmount, symbol, "", transaction.tx)
            }
        }
    }
);


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




async function getTransactions(wallet = "0x62c74109d073d5bd3cf6b4e6a91a77c3d4cf310a") {

    // await volumeTransactionModel.deleteMany({});
    console.log("start get transactions")
    let res = "";
    // try {
    //     res = await getTokenTransactionsEth(wallet);

    //     console.log(res, "getTokenTransactionsEth")
    //     for (let i = 0; i < res.transfers?.length; i++) {
    //         const element = res.transfers[i];
    //         let transaction = {
    //             date: new Date(element.metadata.blockTimestamp),
    //             receivedAmount: divideByDecimals(element.value + "", parseInt(element.rawContract.decimal, 16)),
    //             symbol: element.asset || "USDT",
    //             tx: element.hash,
    //             walletSend: element.from,
    //         };
    //         if (transaction.receivedAmount > 1)
    //             await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
    //     }
    //     logger.info("eth transactions from " + wallet + " inserted")

    // } catch (error) {
    //     console.log(error.message, "error eth")
    // }
    // try {
    //     res = await getTokenTransactionsPolygon(wallet);
    //     console.log(res, " getTokenTransactionsPolygon")
    //     let tokens = [process.env.POLYGON_USDT.toLowerCase(), process.env.POLYGON_USDC.toLowerCase()]
    //     for (let i = 0; i < res.transfers.length; i++) {
    //         const element = res.transfers[i];
    //         if (element.value != null && tokens.includes(element?.rawContract?.address.toLowerCase())) {
    //             console.log(element)

    //             let transaction = {
    //                 date: new Date(element.metadata.blockTimestamp),
    //                 receivedAmount: divideByDecimals(element.value + "", parseInt(element.rawContract.decimal, 16)),
    //                 symbol: element.asset || "USDT",
    //                 tx: element.hash,
    //                 walletSend: element.from,
    //             };
    //             if (transaction.receivedAmount > 1)
    //                 await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
    //         }
    //     }
    //     logger.info("POLYGON transactions from " + wallet + " inserted")

    // } catch (error) {
    //     console.log(error.message, "error polygon")
    // }

    // let solanaWallet = "jNDK3f71jgZdQLysYsdU5sXfBxwEQSDWfmJNLrhGVAk";
    // const tokenMints = [
    //     'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    //     'FCqfQfr7chiC9bSG3zKSm8AsM9XuK5v6KEsNfGpP73rE'  // USDC
    // ];
    // try {
    //     let transactions = await getTokenTransactionsSolana(solanaWallet);
    //     console.log(transactions, " getTokenTransactionsPolygon")
    //     const receivedTokens = [];

    //     for (let forTra = 0; forTra < transactions.length; forTra++) {
    //         const transaction = transactions[forTra];
    //         for (let index = 0; index < transaction?.meta?.postTokenBalances?.length; index++) {
    //             const balance = transaction.meta.postTokenBalances[index];
    //             if (balance.owner === solanaWallet && tokenMints.includes(balance.mint)) {
    //                 const preBalance = transaction.meta.preTokenBalances.find(b => b.accountIndex === balance.accountIndex) || { uiTokenAmount: { amount: 0 } };
    //                 const receivedAmount = parseFloat(balance.uiTokenAmount.amount) - parseFloat(preBalance.uiTokenAmount.amount);
    //                 if (receivedAmount > 0) {
    //                     let t = {
    //                         date: new Date(transaction.blockTime * 1000),
    //                         receivedAmount: receivedAmount / (10 ** balance.uiTokenAmount.decimals),
    //                         symbol: "USDT",
    //                         tx: transaction.transaction?.signatures[0]?.publicKey.toString(),
    //                         walletSend: (transaction.transaction._message.accountKeys.find(acc => acc !== solanaWallet)).toString()
    //                     };
    //                     if (t.receivedAmount > 1)
    //                         await volumeTransactionModel.updateOne({ tx: t.tx }, { $set: t }, { upsert: true });
    //                 }
    //             }
    //         }
    //     }
    //     logger.info("solana transactions from " + solanaWallet + " inserted")


    // } catch (error) {
    //     console.log(error.message, "error solana")
    // }

    // try {
    //     await getTransactionWalletTron();

    // } catch (error) {
    //     console.log(error.message, "error tron")

    // }

    // try {
    //     await loadTransactionsExcel();

    // } catch (error) {
    //     console.log(error.message, "error tron")

    // }

    // try {
    //     let prices = await getPrices();
    //     let btc = "32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L";
    //     getBitcoinTransactions(btc).then(transactions => {
    //         // console.log(transactions)
    //         transactions?.forEach(async tx => {
    //             // console.log(tx);
    //             tx.out.forEach(async output => {
    //                 if (output.addr === btc) {
    //                     // console.log(`Received Amount: ${output.value / 100000000} BTC`);
    //                     let t = {
    //                         date: new Date(tx.time),
    //                         receivedAmount: (output.value / 100000000) * prices.BTCUSDT,
    //                         symbol: "BTC",
    //                         tx: tx.hash,
    //                         walletSend: output.addr
    //                     };
    //                     if (t.receivedAmount > 1)
    //                         await volumeTransactionModel.updateOne({ tx: t.tx }, { $set: t }, { upsert: true });
    //                 }
    //             });
    //         });
    //     });
    //     logger.info("BTC transactions from " + btc + " inserted")
    //     console.log("finish get transactions")
    // } catch (error) {
    //     console.log(error.message, "error btc")

    // }




    setInterval(getTransactions, 10 * 60 * 60 * 1000); // cada 10 hs
}


if (process.env.AUTOMATIC_FUNCTIONS != "off") {
    getTransactions();
}

async function getTransactionDetails(txHash) {
    try {
        const web3 = new Web3(`https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`);
        // Obtener el recibo de la transacción
        const receiptResponse = await axios.post(`https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`, {
            jsonrpc: "2.0",
            method: "eth_getTransactionReceipt",
            params: [txHash],
            id: 1
        });
        const receipt = receiptResponse.data.result;
        let providerr = new AlchemyProvider(Network.ETH_MAINNET, ALCHEMY_API_KEY, 5);
        // Analizar los logs para encontrar eventos de transferencia de tokens
        for (const log of receipt.logs) {
            if (log.topics[0] === web3.utils.sha3('Transfer(address,address,uint256)')) {
                const from = `0x${log.topics[1].slice(26)}`;
                const to = `0x${log.topics[2].slice(26)}`;
                const value = web3.utils.hexToNumberString(log.data);
                const tokenContract = log.address;
                const contract2 = new Contract(tokenContract, ERC20.abi, providerr);
                let decimals = await contract2.decimals();
                let symbol = await contract2.symbol();

                return {
                    from, to, decimals, tokenContract, symbol, hash: txHash, value: divideByDecimals(value + "", decimals)
                }

            }
        }
    } catch (error) {
        console.error('Error getting transaction details:', error);
    }
}



// socket.addEventListener('message', async function (event) {
//     let data = JSON.parse(event.data);
//     console.log(data, "DATA MESSAGE:")
//     if (data?.params?.result?.transaction) {
//         let transactionB = await getTransactionDetails(data.params.result.transaction.hash);
//         console.log(data.params.result.transaction.hash, transactionB);
//         if (transactionB == undefined) {
//             return;
//         }
//         let url = "https://etherscan.io/tx/";
//         if (transactionB?.symbol == "WETH") {
//             transactionB.symbol = "ETH";
//         }
//         let gasPriceInWei = await getPrices();
//         console.log(gasPriceInWei, transactionB.value, transactionB.value * gasPriceInWei.ETHUSDT);
//         let transaction = {
//             date: Date.now(),
//             receivedAmount: transactionB.value * gasPriceInWei.ETHUSDT,
//             shieldFee: 0,
//             symbol: transactionB.symbol,
//             tx: data.params.result.transaction.hash,
//             walletSend: transactionB.from,
//         }
//         // await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
//         console.log(formatCurrency(transaction.receivedAmount) + transaction.symbol + " was received ,TX :  " + url + transaction.tx);
//         // await sendGroupMessage(transaction.receivedAmount + transaction.symbol + " was received ,TX :  " + url + transaction.tx)
//         // await EmailController.sendPaymentReceivedPaymentEmail(process.env.EMAIL_NOTIFICATIONS, url + transaction.tx, transaction.receivedAmount, transaction.symbol, "", transaction.tx)
//     }
// });
router.post('/webhook/', async (req, res) => {
    let body = req.body;
    try {
        let b = new AlchemyWebHookResponseModel({ body });
        await b.save();
        // body = (await AlchemyWebHookResponseModel.findOne({ _id: "66acf80eef409422cb13fc31" })).body;
        console.log(body);
        for (let iActivity = 0; iActivity < body.event.activity.length; iActivity++) {
            const tx = body.event.activity[iActivity];
            let url = "https://etherscan.io/tx/";
            tx.value = Number(tx.value).toFixed(tx.rawContract.decimals);
            let amount = tx.value;
            console.log(amount, "AMOUNT")
            if (body.event.network == "ETH_MAINNET") {
                url = "https://etherscan.io/tx/";

            } else if (body.event.network == "MATIC_MAINNET") {
                url = "https://polygonscan.com/tx/";
            }
            if (tx.asset == "ETH" || tx.asset == "MATIC") {

                let gasPriceInWei = await getPrices();
                if (tx.asset == "ETH")
                    amount = Number(amount) * gasPriceInWei.ETHUSDT;
                if (tx.asset == "MATIC")
                    amount = Number(amount) * gasPriceInWei.MATICUSDT;
            }
            let transaction = {
                date: Date.now(),
                receivedAmount: amount,
                shieldFee: 0,
                symbol: tx.asset,
                tx: tx.hash,
                walletSend: tx.fromAddress,
            }
            console.log(transaction)
            if (tx.asset == "USDT" || tx.asset == "USDC" || tx.asset == "ETH" || tx.asset == "MATIC") {
                await volumeTransactionModel.updateOne({ tx: transaction.tx }, { $set: transaction }, { upsert: true });
            }
            console.log(formatCurrency(removeCeros(tx.value)) + tx.asset + " was received ,TX :  " + url + tx.hash);
            await sendGroupMessage(formatCurrency(removeCeros(tx.value)) + tx.asset + " was received ,TX :  " + url + tx.hash)
            await EmailController.sendPaymentReceivedPaymentEmail(process.env.EMAIL_NOTIFICATIONS, url + transaction.tx, removeCeros(tx.value), tx.asset, "", tx.hash)

        }

    } catch (error) {
        console.log(error)
    }
    res.send({ statusCode: 200, response: "success" })
});

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

router.post('/import/excel-transactions', apiKeyMaster, async (req, res) => {
    try {
        await loadTransactionsExcel();
        res.json(response('Transactions imported', 'success'));
    } catch (error) {
        handleHttpError(error, res);
    }
});

module.exports = router;
