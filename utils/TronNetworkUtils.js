// const TronWeb = require('tronweb'); // there is no types for tronweb

const fetch = require('node-fetch');
const TransactionLogController = require('../controllers/transactionsLogs.controller');
const bs58 = require('bs58');
const crypto = require('crypto');

async function getTransactionDetails(hash) {
    try {
        // Busca en la base de datos si la transacción ya está almacenada
        let tx = await TransactionLogController.findOne({ hash: hash, network: "tron" });

        // Si se encuentra en la base de datos, la devuelve
        if (tx != undefined && tx != null) {
            if (tx.transfersAllList?.length == 0) {
                await tx.delete()
            } else {
                return tx;
            }
        }

        console.log("buscando en blockchain")
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
function ethToTron(ethAddress) {
    // Remove the '0x' prefix
    ethAddress = ethAddress.slice(2);

    // Convert the hex string to bytes
    const ethBytes = Buffer.from(ethAddress, 'hex');

    // Add the Tron prefix byte (0x41)
    const tronBytes = Buffer.concat([Buffer.from([0x41]), ethBytes]);

    // Calculate the checksum
    const hash1 = crypto.createHash('sha256').update(tronBytes).digest();
    const hash2 = crypto.createHash('sha256').update(hash1).digest();
    const checksum = hash2.slice(0, 4);

    // Append the checksum to the Tron address bytes
    const tronAddress = Buffer.concat([tronBytes, checksum]);

    // Encode the result in Base58
    const tronAddressBase58 = bs58.encode(tronAddress);

    return tronAddressBase58;
}

// Exportar todas las funciones del archivo automáticamente
module.exports = {
    getTransactionDetails, ethToTron
};



