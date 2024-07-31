const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['buy', 'sell'], required: true },
    userId: { type: String, required: true },
    status: { type: String, enum: ['initiated', 'bankDetailsProvided', 'confirmed', 'notified'], default: 'initiated' },
    bankDetails: {
        bankName: String,
        accountNumber: String,
        beneficiaryName: String,
        routingNumber: String,
        country: String,
        state: String,
        city: String,
        streetAddress: String,
        zipCode: String
    },
    transactionDetails: {
        amountTransferred: Number,
        cryptoToPurchase: String,
        walletAddress: String,
        amountToTransfer: Number,
        transactionHash: String,
        networkId: String,
        assetId: String,
    },
}, { timestamps: true });

module.exports = mongoose.model('TransactionBuySell', transactionSchema);
