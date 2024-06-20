// const TronWeb = require('tronweb'); // there is no types for tronweb

const { ethers } = require('ethers');
const { Response } = require('express');
const { validate } = require('bitcoin-address-validation');
const Airtable = require('airtable');
const fetch = require('node-fetch');
const base58 = require('bs58');
const { Buffer } = require('buffer');
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
const TransactionLogController = require('../controllers/transactionsLogs.controller');
// const TransactionsLogModel = require('../models/transactionsLog.model');
const multer = require('multer');
const path = require('path');
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

async function getTransactionTron(hash, paymentId = null, linkpaymentId = null) {
  try {
    // Busca en la base de datos si la transacción ya está almacenada
    let tx = await TransactionLogController.findOne({ hash: hash, network: "tron" });

    // Si se encuentra en la base de datos, la devuelve
    if (tx != undefined && tx != null) {
      return tx;
    }

    // // Consulta la API de TronGrid para obtener la información de la transacción
    let options = {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ value: hash })
    };

    const apiKey = 'f79519c1-ed9c-4e07-8847-0a918bd2dc09';
    const endpoint = 'https://apilist.tronscanapi.com/api/';

    let response = await fetch(endpoint + "transaction-info?hash=" + hash, {
      headers: {
        'TRON-PRO-API-KEY': apiKey
      }
    })

    // let response = await fetch('https://api.trongrid.io/wallet/gettransactioninfobyid', options);
    // let response = await fetch('https://api.trongrid.io/v1/accounts/TTd9qHyjqiUkfTxe3gotbuTMpjU8LEbpkN/transactions/trc20', options);
    options = { method: 'GET', headers: { accept: 'application/json' } };

    // let response = await fetch('https://api.trongrid.io/v1/accounts/TXmgYw1jWsN4jSABtNxF6HwhasTPM39Cay/transactions/trc20?limit=200&only_to=true', options)

    let data = await response.json();
    if (paymentId != null)
      data.paymentId = paymentId;
    if (linkpaymentId != null)
      data.linkpaymentId = linkpaymentId;

    data.hash = hash;
    data.network = "tron";
    // Guarda la transacción en la base de datos
    await TransactionLogController.createTransaction(data);
    return data;

  } catch (error) {
    console.error('Error fetching transaction status:', error);
    return { error: "error not found" };
  }
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
  baseDebitCards, response, getTransactionTron, upload, divideByDecimals, limitDecimals,
  ...require('./buildSyncResponse')
};
