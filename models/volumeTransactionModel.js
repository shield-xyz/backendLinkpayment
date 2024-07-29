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
        type: String,
    },
    receivedAmount: {
        type: Number, // Corresponde a "receivedAmountUSD"
    },
    totalReceived: {
        type: String,
    },
    shieldFee: {
        type: String,
    },
    clientTransfer: {
        type: String,
    },
    gasFees: {
        type: String,
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
        type: String,
        trim: true
    },
    totalNetProfits: {
        type: String,
        trim: true
    },
    numberOfTransactions: {
        type: String,
        trim: true
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
