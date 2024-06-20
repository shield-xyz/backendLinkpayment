const fetch = require('node-fetch');

const url = `https://api.blockcypher.com/v1/btc/main/txs/`;

// Función para obtener los detalles de la transacción
async function getTransactionDetails(txid) {
    try {
        const response = await fetch(url + txid);
        const data = await response.json();

        console.log('ID de Transacción:', data.hash);
        console.log('Cantidad Enviada (Satoshis):', data.total);
        console.log('Cartera de Origen:');
        data.inputs.forEach(input => {
            console.log(' - Dirección:', input.addresses[0]);
        });
        console.log('Carteras de Destino:');
        data.outputs.forEach(output => {
            console.log(' - Dirección:', output.addresses[0], 'Cantidad:', output.value);
        });
    } catch (error) {
        console.error('Error obteniendo los detalles de la transacción:', error);
    }
}


// Exportar todas las funciones del archivo automáticamente
module.exports = {
    getTransactionDetails,
};



