const { Web3 } = require('web3');

// Configura tu provider de Web3 usando la variable de entorno INFURA_URL_NODE
const web3 = new Web3(process.env.INFURA_URL_NODE);
// Método para obtener detalles de una transacción por su hash
async function getTransactionDetails(txHash) {
    try {
        const transaction = await web3.eth.getTransaction(txHash);

        if (!transaction) {
            console.log('No transaction found for this hash.');
            return null;
        }

        console.log('Transaction:', transaction);
        return transaction;
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        throw error;
    }
}

// Otra función para obtener el saldo de una dirección
async function getBalance(address) {
    try {
        const balance = await web3.eth.getBalance(address);
        console.log('Balance:', balance);
        return balance;
    } catch (error) {
        console.error('Error retrieving balance:', error);
        throw error;
    }
}

// Exportar todas las funciones del archivo automáticamente
module.exports = {
    getTransactionDetails,
    getBalance
};
