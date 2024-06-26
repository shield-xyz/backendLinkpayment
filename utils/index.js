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
const BitcoinNetworkUtils = require("./BitcoinNetworkUtils");
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
    console.log("file . ", req.merchant?._id ? req.merchant._id + path.extname(file.originalname) : uniqueSuffix + path.extname(file.originalname), req.merchant)
    cb(null, req.merchant?._id ? req.merchant._id + path.extname(file.originalname) : uniqueSuffix + path.extname(file.originalname));
  }
});
const walletNetworkUser = require("../models/walletNetworkUser.model")

const upload = multer({ storage: storage });



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

async function getPrices() {
  const symbols = [
    // 'ETHUSDT',
    'BTCUSDT',
    'BNBUSDT'
  ]; // Puedes añadir más símbolos aquí
  const url = `https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=${process.env.CRYPTO_COMPARE_API}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    let prices = {};
    if (data.USD) {
      console.log(`El precio de 1 BTC es $${data.USD} USD.`);
      prices.BTCUSDT = data.USD;
    } else {
      console.error('Error al obtener el precio de BTC:', data);
      return {};
    }
    return prices;
  } catch (error) {
    console.error('Error al realizar la solicitud:', error);
    return {};

  }

  // const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(JSON.stringify(symbols))}`);
  // const data = await response.json();
  // console.log(data);
  // const prices = data.reduce((acc, ticker) => {
  //   acc[ticker.symbol] = ticker.price;
  //   return acc;
  // }, {});

  // console.log('Precios de los tokens:', prices);

}





async function validatePayment(hash, amount, network, asset, userId, linkId = null, paymentId = null) {
  try {
    let transactionLog, transactionTimestamp, tenMinutesAgo;
    let isValid = false;

    let addressTopay = await walletNetworkUser.findOne({ userId: userId, networkId: network.networkId });
    switch (network.networkId) {
      case "tron":
        let quantity
        transactionLog = await TronNetworkUtils.getTransactionDetails(hash);
        console.log(transactionLog);
        if (process.env.TRON_END_POINT.includes("shasta")) {

          return response("correct transaction");
        }
        if (transactionLog.error) {
          return response("error transaction log", "error");
        }
        if (!transactionLog.hash || transactionLog.network) {//guardamos la informacion del a transaccion log

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
          logger.fontColorLog("blue", "network address ->" + addressTopay.address.toLowerCase())
          logger.fontColorLog('blue', x.to_address.toLowerCase() == addressTopay.address.toLowerCase());
          if (x.to_address.toLowerCase() == addressTopay.address.toLowerCase()) //network.deposit_address.toLowerCase() validamos que el que recibio el token es nuestra wallet de tx.
            if (x.contract_address.toLowerCase() == asset.address.toLowerCase()) {  //primero deberiamos validar que sea el token del asset 
              //validar la cantidad de token
              quantity = divideByDecimals(x.amount_str, x.decimals);
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
        if (!transactionLog?.network) {

          transactionLog.paymentId = paymentId;
          transactionLog.linkpaymentId = linkId;
          transactionLog.hash = hash;
          transactionLog.network = network.networkId;
        }
        await transactionLog.save();

        if (transactionLog?.applied == true) {
          return response("transaciont used for another payment", "error");
        }
        logger.fontColorLog("blue", "network address ->" + addressTopay.address.toLowerCase())
        logger.fontColorLog('blue', transactionLog.to.toLowerCase() == addressTopay.address.toLowerCase());
        if (transactionLog.to.toLowerCase() == addressTopay.address.toLowerCase()) // validamos que el que recibio el token es nuestra wallet de tx.
          if (transactionLog.tokenContract.toLowerCase() == asset.address.toLowerCase()) {  //primero deberiamos validar que sea el token del asset 
            //validar la cantidad de token
            let quantity = divideByDecimals(transactionLog.value, asset.decimals);
            if (quantity >= amount) {
              isValid = true;
              transactionLog.applied = true;
              await transactionLog.save();
              return response("correct transaction");
            }
          }
        return response("incorrect transaction", "error");
        break;
      case "bitcoin":
        transactionLog = await BitcoinNetworkUtils.getTransactionDetails(hash);
        console.log(transactionLog);

        if (!transactionLog?.network) {

          transactionLog.paymentId = paymentId;
          transactionLog.linkpaymentId = linkId;
          transactionLog.hash = hash;
          transactionLog.network = network.networkId;
        }
        await transactionLog.save();
        // no fue ya aplicada
        if (transactionLog?.applied == true) {
          return response("transaciont used for another payment", "error");
        }
        // fecha no mas vieja a 10 minutos.
        transactionTimestamp = new Date(transactionLog.received);
        tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        // Validar que la transacción sea de hace 10 minutos o menos
        if (transactionTimestamp < tenMinutesAgo) {
          return response("date greater than 10 minutes", "error");
        }

        for (let i = 0; i < transactionLog.outputs.length; i++) {//recorrer los outputs (salidas de btc a wallets) 
          let output = transactionLog.outputs[i];
          if (output.addresses[0].toLowerCase() == addressTopay.address.toLowerCase()) { //si coincide con la nuestra 
            if (output.value >= amount) {   // coincide el monto
              isValid = true;
              transactionLog.applied = true;
              await transactionLog.save();
              return response("correct transaction");
            }

          }
        }
        return response("incorrect transaction", "error");
        break;
      default: return response("network not found", "error");
    }
  } catch (error) {
    console.log(error)
    return response("incorrect transaction", "error");

  }


}
module.exports = {
  handleError,
  handleHttpError,
  validateResponse, response, upload, divideByDecimals, limitDecimals, validatePayment, getPrices,
  ...require('./buildSyncResponse')
};
