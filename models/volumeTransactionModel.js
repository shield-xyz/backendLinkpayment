const mongoose = require('mongoose');

const volumeTransactionSchema = new mongoose.Schema({
    client: {
        type: String,
    },
    business: {
        type: String,
    },
    jurisdiction: {
        type: String,
    },
    methodPay: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    receivedAmount: {
        type: Number,
        required: true
    },
    symbol: {
        type: String,
        required: true,
        trim: true
    },
    tx: {
        type: String,
        trim: true
    },
    walletSend: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('VolumeTransaction', volumeTransactionSchema);
