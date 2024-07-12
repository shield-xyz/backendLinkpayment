const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EthereumTransactionSchema = new Schema({
    accessList: { type: Array, default: [] },
    blockHash: { type: String, },
    blockNumber: { type: mongoose.Types.Decimal128, },
    chainId: { type: mongoose.Types.Decimal128, },
    gas: { type: mongoose.Types.Decimal128, },
    gasPrice: { type: mongoose.Types.Decimal128, },
    hash: { type: String, unique: true },
    input: { type: String, },
    maxFeePerGas: { type: mongoose.Types.Decimal128, },
    maxPriorityFeePerGas: { type: mongoose.Types.Decimal128, },
    nonce: { type: mongoose.Types.Decimal128, },
    r: { type: String, },
    s: { type: String, },
    transactionIndex: { type: mongoose.Types.Decimal128, },
    type: { type: mongoose.Types.Decimal128, },
    v: { type: mongoose.Types.Decimal128, },
    value: { type: String, },
    data: { type: String, },
    network: String,
    from: { type: String, },
    to: { type: String, },
    tokenContract: { type: String, },
    applied: { type: Boolean, default: false }
});

module.exports = mongoose.model('TransactionLogsEthereum', EthereumTransactionSchema);
