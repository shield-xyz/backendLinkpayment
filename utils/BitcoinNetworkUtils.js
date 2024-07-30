const fetch = require('node-fetch');
const TransactionsBitcoin = require('../models/TransactionsBitcoin.model');
const axios = require("axios")
// const { divideByDecimals } = require('../utils/index');
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
function satoshisToBitcoin(satoshis) {
    const SATOSHIS_PER_BITCOIN = 100000000;
    return satoshis / SATOSHIS_PER_BITCOIN;
}
const url = `https://api.blockcypher.com/v1/btc/main/txs/`;
// Función para obtener los detalles de la transacción
async function getTransactionDetails(hash) {
    try {
        let tx = await TransactionsBitcoin.findOne({ hash: hash, network: 'bitcoin' });

        // Si se encuentra en la base de datos, la devuelve
        if (tx) {
            return tx;
        }
        const response = await fetch(url + hash);
        const data = await response.json();
        data.totalBTC = satoshisToBitcoin(data.total);
        data.outputs.map(output => {
            output.value = satoshisToBitcoin(output.value);
            return output;
        });
        let transaction = await TransactionsBitcoin.create(data);
        return transaction;

    } catch (error) {
        console.error('Error obteniendo los detalles de la transacción:', error);
        return {}
    }
}
async function getBitcoinTransactions(address) {
    try {
        const url = `https://blockchain.info/rawaddr/${address}`;
        const response = await axios.get(url);
        const transactions = response.data.txs;


        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
    }
}


// Exportar todas las funciones del archivo automáticamente
module.exports = {
    getTransactionDetails, getBitcoinTransactions
};



