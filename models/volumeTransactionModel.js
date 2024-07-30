const mongoose = require('mongoose');

const volumeTransactionSchema = new mongoose.Schema({
    business: {
        type: String, // Corresponde a "Regulatory Period"
        default: "Pre-Compliance"
    },
    client: {
        type: String, // Corresponde a "Client Name"
    },
    jurisdiction: {
        type: String,
    },
    methodPay: {
        type: String,
        default: "Wire"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    receivedAmountEUR: {
        type: Number,
    },
    receivedAmount: {
        type: Number, // Corresponde a "receivedAmountUSD"
    },
    totalReceived: {
        type: Number,
    },
    shieldFee: {
        type: Number,
    },
    clientTransfer: {
        type: Number,
    },
    grossProfit: {
        type: Number,
    },
    conversionFees: {
        type: Number,
    },
    withdrawalFees: {
        type: Number,
    },
    gasFees: {
        type: Number,
    },
    netProfit: {
        type: Number,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    tx: {
        type: String,
        trim: true
    },
    walletSend: {
        type: String, // Corresponde a "Wallet Address"
        trim: true,
    },
    riskScore: {
        type: String,
    },
    selfHosted: {
        type: Boolean,
        default: false,
    },
    kycAml: {
        type: Boolean,
        default: false,
    },
    partner: {
        type: String,
    },
    onrampOfframp: {
        type: String,
    },
    currencyPair: {
        type: String,
    },
    blockchain: {
        type: String,
    },
    notes: {
        type: String,
        trim: true
    },
    totalGmv: {
        type: Number,
    },
    totalNetProfits: {
        type: Number,
    },
    numberOfTransactions: {
        type: Number,
    },
    excelLoad: {
        type: Boolean,
        default: false
    },
    symbol: {
        type: String,
        default: "USDT" // Default value
    }
});

module.exports = mongoose.model('VolumeTransaction', volumeTransactionSchema);
