// const TronWeb = require('tronweb'); // there is no types for tronweb

const fetch = require('node-fetch');
const TransactionLogController = require('../controllers/transactionsLogs.controller');

async function getTransactionDetails(hash) {
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

        const apiKey = process.env.TRON_API_SCAN;
        const endpoint = process.env.TRON_END_POINT;//'https://apilist.tronscanapi.com/api/';

        let response = await fetch(endpoint + "transaction-info?hash=" + hash, {
            headers: {
                'TRON-PRO-API-KEY': apiKey
            }
        })
        options = { method: 'GET', headers: { accept: 'application/json' } };

        let data = await response.json();
        let transaction = await TransactionLogController.createTransaction(data);
        // console.log(transaction)
        return transaction;

    } catch (error) {
        console.error('Error fetching transaction status:', error);
        return { error: "error not found" };
    }
}


// Exportar todas las funciones del archivo automáticamente
module.exports = {
    getTransactionDetails,
};



