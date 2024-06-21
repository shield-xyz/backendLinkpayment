// const TronWeb = require('tronweb'); // there is no types for tronweb

const { ethers } = require('ethers');
const { Response } = require('express');
const { validate } = require('bitcoin-address-validation');
const Airtable = require('airtable');
const fetch = require('node-fetch');
const base58 = require('bs58');
const { Buffer } = require('buffer');
const TronNetworkUtils = require("./TronNetworkUtils");
const EthereumNetworkUtils = require("./EthereumNetworkUtils");
const { CHAIN_TYPE, CRYPT_API_KEY,
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
} = require('../config');
const {
  RAMP_CLIENT_ID,
  RAMP_SECRET_ID,
  RAMP_API_URL,
  TOKENS,
} = require('../config');
const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
const baseDebitCards = base(AIRTABLE_TABLE_NAME);
async function loadTronWeb() {
  const TronWeb = await import('tronweb');
  return TronWeb;
};
const https = require('https');
const ccxt = require('ccxt');
// const TransactionsLogModel = require('../models/transactionsLog.model');
const multer = require('multer');
const path = require('path');
const logger = require('node-color-log');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: function (req, file, cb) {
    // console.log("savefile")
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, req.merchant?._id ? req.merchant._id + "" : uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

async function getRampToken() {
  try {
    const endpoint = `${RAMP_API_URL}/token`;

    const clientId = RAMP_CLIENT_ID;
    const clientSecret = RAMP_SECRET_ID;

    const headers = {
      Accept: 'application/json',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    };

    const requestBody = {
      grant_type: 'client_credentials',
      scope: 'cards:read transactions:read limits:read limits:write',
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams(requestBody),
    });

    validateResponse(response, 'An error occurred while fetching ramp token');

    const tokenRes = await response.json();
    return tokenRes.access_token;
  } catch (error) {
    handleError(error, 'An error occurred while getting ramp token');
  }
}

async function getRampUserId(userId) {
  try {
    const records = await baseDebitCards
      .select({
        filterByFormula: `{userId} = "${userId}"`,
      })
      .firstPage();

    const rampUserId = records.map((record) => record.fields.rampUserId)[0];

    return rampUserId;
  } catch (error) {
    handleError(error, 'An error occurred while getting ramp user id');
  }
}

function calculateTotalBalance({ balances, prices }) {
  return balances?.reduce((acc, balance) => {
    const { price = 0 } =
      prices.find((price) => price.name === balance.currency) || {};
    return acc + balance.amount * price;
  }, 0);
}

async function validateWalletAddress(address, type) {
  try {
    if (!address) {
      throw new Error('Wallet address is empty!');
    }
    if (!type) {
      throw new Error('Blockchain type is empty!');
    }

    if (
      type !== CHAIN_TYPE.BTC &&
      type !== CHAIN_TYPE.ETH &&
      type !== CHAIN_TYPE.TRON
    ) {
      throw new Error('Blockchain type is not valid!');
    }

    if (type === CHAIN_TYPE.BTC && !validate(address)) {
      throw new Error('Bitcoin address is not valid address!');
    }

    if (type === CHAIN_TYPE.ETH && !ethers.isAddress(address)) {
      throw new Error('Ethereum address is not valid address!');
    }
    if (type === CHAIN_TYPE.TRON) {
      const TronWeb = await loadTronWeb();
      const tronWeb = new TronWeb({
        fullHost: 'https://api.trongrid.io',
      });
      if (!tronWeb.isAddress(address)) {
        throw new Error('Tron address is not valid address!');
      }
    }
    return true;
  } catch (error) {
    handleError(error, 'An error occurred while validating the wallet address');
  }
}

async function getExchangeRate(ticker) {
  try {
    const rates = await getAllExchangeRates();
    const rate = rates.find((rate) => rate.name === ticker);

    if (!rate) {
      throw new Error(`Exchange rate for ${ticker} not found`);
    }

    return rate;
  } catch (err) {
    handleError(err, 'An error occurred while executing getExchangeRate');
  }
}

async function getAllExchangeRates() {
  try {
    const symbols = TOKENS.map((tokenName) => `${tokenName}/USD`);

    const exchange = new ccxt.kraken();

    let priceArr = [];

    const tickers = await exchange.fetchTickers(symbols);

    for (let ticker of Object.keys(tickers)) {
      const price = tickers[ticker].last;
      const token = ticker.split('/')[0];
      priceArr.push({ name: token, price: Number(price) });
    }

    return priceArr;
  } catch (err) {
    handleError(err, 'An error occurred while executing getAllExchangeRates');
  }
}

async function getHistoricPrice(ticker, dateStr) {
  try {
    if (TOKENS.indexOf(ticker) === -1) {
      throw new Error(
        `Invalid ticker! The ticker must be one of the following: ${TOKENS.join(
          ', '
        )}`
      );
    }

    const exchange = new ccxt.kraken();
    const timestamp = new Date(dateStr).getTime();
    const data = await exchange.fetchOHLCV(
      `${ticker}/USDT`,
      '1m',
      timestamp,
      1
    );

    return data[0][1];
  } catch (err) {
    handleError(err, 'An error occurred while executing getHistoricPrice');
  }
}

function handleError(error, defaultMessage) {
  let message = defaultMessage;
  if (error instanceof Error) {
    message = error.message;
  }
  console.error(error);
  throw new Error(message);
}

function handleHttpError(error, res, statusCode = 500) {
  if (error instanceof Error) {
    res.status(statusCode).send({ response: error.message, status: "error" });
  } else {
    res.status(statusCode).send({ response: 'An error occurred', status: "error" });
  }
  console.error(error);
}

function validateResponse(response, message) {
  if (!response.ok) {
    throw new Error(`${message}: ${response.status} - ${response.statusText}`);
  }
}

function getTransactionById(txId) {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'rest.cryptoapis.io',
      path: `/v2/blockchain-data/bitcoin/testnet/transactions/${txId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': CRYPT_API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const data = Buffer.concat(chunks);
        try {
          const result = JSON.parse(data.toString());
          resolve(result); // Resolve the promise with the result
        } catch (e) {
          reject(e); // Reject the promise if an error occurs
        }
      });
    });

    req.on('error', (e) => {
      reject(e); // Reject the promise if an error occurs during the request
    });

    req.end();
  });
}
let response = (data, status = "success") => {
  return { response: data, status: status }
}


// Función para convertir direcciones de formato hexadecimal a Base58Check
function convertHexToBase58(hexAddress) {
  const addressBuffer = Buffer.from(hexAddress, 'hex');
  const addressBase58 = base58.encode(addressBuffer);
  return addressBase58;
}
function limitDecimals(number, decimals) {
  return parseFloat(number.toFixed(decimals));
}
function divideByDecimals(value, decimals) {
  if (typeof value !== 'string' || typeof decimals !== 'number') {
    throw new Error('Invalid input types. "value" should be a string and "decimals" should be a number.');
  }

  const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    throw new Error('The provided value is not a valid number.');
  }

  const divisor = Math.pow(10, decimals);
  return numericValue / divisor;
}


async function validatePayment(hash, amount, network, asset, linkId = null, paymentId = null) {

  let transactionLog, transactionTimestamp, tenMinutesAgo;
  switch (network.networkId) {
    case "tron":
      transactionLog = await TronNetworkUtils.getTransactionDetails(hash);
      if (transactionLog.error) {
        return response("error transaction log", "error");
      }
      if (!transactionLog.hash || transactionLog.network) {//guardamos la informacion del a transaccion log
        transactionLog.paymentId = paymentId;
        transactionLog.linkpaymentId = linkId;
        transactionLog.hash = hash;
        transactionLog.network = network.networkId;
      }
      await transactionLog.save();
      transactionTimestamp = new Date(transactionLog.timestamp);
      tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      // Validar que la transacción sea de hace 10 minutos o menos
      if (transactionTimestamp < tenMinutesAgo) {
        return response("date greater than 10 minutes", "error");
      }
      for (let iData = 0; iData < transactionLog.transfersAllList.length; iData++) {
        const x = transactionLog.transfersAllList[iData]; // registro de transacciones dentro de la tx .
        logger.fontColorLog("blue", "network address ->" + network.deposit_address.toLowerCase())
        logger.fontColorLog('blue', x.to_address.toLowerCase() == network.deposit_address.toLowerCase());
        if (x.to_address.toLowerCase() == network.deposit_address.toLowerCase()) // validamos que el que recibio el token es nuestra wallet de tx.
          if (x.contract_address.toLowerCase() == asset.address.toLowerCase()) {  //primero deberiamos validar que sea el token del asset 
            //validar la cantidad de token
            let quantity = divideByDecimals(x.amount_str, x.decimals);
            console.log(quantity);
            if (quantity >= amount) {
              isValid = true;
              // payment.hash = hash;
              // payment.status = "success";
              // payment.save();
              // await TransactionController.createTransaction(transactionBody);
              // await PaymentController.loadBalanceImported(req.body.paymentId);
              return response("correct transaction");
            }
          }
      }
      return response("incorrect transaction", "error");


      break;
    case "ethereum":
      transactionLog = await EthereumNetworkUtils.getTransactionDetails(hash);
      console.log(transactionLog);
      if (!transactionLog.network) {

        transactionLog.paymentId = paymentId;
        transactionLog.linkpaymentId = linkId;
        transactionLog.hash = hash;
        transactionLog.network = network.networkId;
      }
      await transactionLog.save();

      if (transactionLog?.applied == true) {
        return response("transaciont used for another payment", "error");
      }
      logger.fontColorLog("blue", "network address ->" + network.deposit_address.toLowerCase())
      logger.fontColorLog('blue', transactionLog.to.toLowerCase() == network.deposit_address.toLowerCase());
      if (transactionLog.to.toLowerCase() == network.deposit_address.toLowerCase()) // validamos que el que recibio el token es nuestra wallet de tx.
        if (transactionLog.tokenContract.toLowerCase() == asset.address.toLowerCase()) {  //primero deberiamos validar que sea el token del asset 
          //validar la cantidad de token
          let quantity = divideByDecimals(transactionLog.value, asset.decimals);
          console.log("qty :; ", quantity);
          if (quantity >= amount) {
            isValid = true;
            // payment.hash = hash;
            // payment.status = "success";
            // payment.save();
            // await TransactionController.createTransaction(transactionBody);
            // await PaymentController.loadBalanceImported(req.body.paymentId);
            return response("correct transaction");
          }
        }
      return response("incorrect transaction", "error");

      console.log(transactionLog, "tx log ethereum");
      break;
    default: return response("network not found", "error");
  }

}
module.exports = {
  getRampToken,
  getRampUserId,
  calculateTotalBalance,
  validateWalletAddress,
  getExchangeRate,
  getAllExchangeRates,
  getHistoricPrice,
  handleError,
  handleHttpError,
  validateResponse,
  getTransactionById,
  baseDebitCards, response, upload, divideByDecimals, limitDecimals, validatePayment,
  ...require('./buildSyncResponse')
};
