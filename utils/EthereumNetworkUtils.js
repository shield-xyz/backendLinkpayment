const { Web3 } = require('web3');
const abiDecoder = require('abi-decoder');
const transactionsEthereumModel = require('../models/transactionsEthereum.model');

// ABI del estándar ERC-20 (simplificado)
const erc20Abi = [
    {
        constant: false,
        inputs: [
            { name: '_to', type: 'address' },
            { name: '_value', type: 'uint256' }
        ],
        name: 'transfer',
        outputs: [],
        type: 'function'
    }
];

// Configura tu provider de Web3 usando la variable de entorno INFURA_URL_NODE
const web3 = new Web3(process.env.INFURA_URL_NODE);
abiDecoder.addABI(erc20Abi);

// Método para obtener detalles de una transacción por su hash
async function getTransactionDetails(hash) {
    try {
        let tx = await transactionsEthereumModel.findOne({ hash: hash, network: 'ethereum' });

        // Si se encuentra en la base de datos, la devuelve
        if (tx) {
            return tx;
        }

        const transaction = await web3.eth.getTransaction(hash);
        if (!transaction) {
            console.log('No transaction found for this hash.');
            return null;
        }

        // Obtener el bloque para obtener el timestamp
        const block = await web3.eth.getBlock(transaction.blockNumber);
        const timestamp = block.timestamp;

        // Decodifica los datos de la transacción si es una transacción de tokens
        const decodedData = abiDecoder.decodeMethod(transaction.input);
        if (decodedData && decodedData.name === 'transfer') {
            const from = transaction.from;
            const to = decodedData.params.find(param => param.name === '_to').value;
            const value = decodedData.params.find(param => param.name === '_value').value;
            const tokenContract = transaction.to;



            const ethTransaction = new transactionsEthereumModel({
                accessList: transaction.accessList,
                blockHash: transaction.blockHash,
                blockNumber: Number(transaction.blockNumber),
                chainId: Number(transaction.chainId),
                from: from,
                gas: Number(transaction.gas),
                gasPrice: Number(transaction.gasPrice),
                hash: transaction.hash,
                input: transaction.input,
                maxFeePerGas: Number(transaction.maxFeePerGas),
                maxPriorityFeePerGas: Number(transaction.maxPriorityFeePerGas),
                nonce: Number(transaction.nonce),
                r: transaction.r,
                s: transaction.s,
                to: to,
                tokenContract: tokenContract,
                transactionIndex: Number(transaction.transactionIndex),
                type: Number(transaction.type),
                v: Number(transaction.v),
                value: String(value),
                data: transaction.input,
                timestamp: Number(timestamp),
                network: 'ethereum'
            });

            await ethTransaction.save();

            return ethTransaction;
        }

        const ethTransaction = new transactionsEthereumModel({
            accessList: transaction.accessList,
            blockHash: transaction.blockHash,
            blockNumber: Number(transaction.blockNumber),
            chainId: Number(transaction.chainId),
            from: transaction.from,
            gas: Number(transaction.gas),
            gasPrice: Number(transaction.gasPrice),
            hash: transaction.hash,
            input: transaction.input,
            maxFeePerGas: Number(transaction.maxFeePerGas),
            maxPriorityFeePerGas: Number(transaction.maxPriorityFeePerGas),
            nonce: Number(transaction.nonce),
            r: transaction.r,
            s: transaction.s,
            to: transaction.to,
            transactionIndex: Number(transaction.transactionIndex),
            type: Number(transaction.type),
            v: Number(transaction.v),
            value: Number(transaction.value),
            data: transaction.input,
            timestamp: Number(timestamp),
            network: 'ethereum'
        });

        await ethTransaction.save();

        return ethTransaction;
    } catch (error) {
        console.error('Error retrieving transaction:', error);
        return { error: error };
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
