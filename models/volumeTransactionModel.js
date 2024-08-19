const mongoose = require('mongoose');

const volumeTransactionSchema = new mongoose.Schema({
    client: {
        type: String, // Corresponde a "Client Name"
    },
    userId: { type: String },
    date: {
        type: Date,
        default: Date.now,
    },
    receivedAmount: {
        type: Number, // Corresponde a "receivedAmountUSD"
    },
    shieldFee: {
        type: Number,
        default: 0
    },
    currencyPair: {
        type: String, default: ""
    },
    blockchain: {
        type: String, default: ""
    },
    walletSend: { type: String, default: "" },
    tx: { type: String, },
    symbol: {
        type: String,
        default: "USDT" // Default value
    },
    excelLoad: { type: Boolean, default: false }
});

module.exports = mongoose.model('VolumeTransaction', volumeTransactionSchema);
