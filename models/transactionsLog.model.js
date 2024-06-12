const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        trim: true
    },
    topics: {
        type: [String],
        required: true
    },
    data: {
        type: String,
        required: true,
        trim: true
    }
}, { _id: false });

const ReceiptSchema = new mongoose.Schema({
    energy_fee: {
        type: Number,
        required: true
    },
    energy_usage_total: {
        type: Number,
        required: true
    },
    net_usage: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        required: true,
        trim: true
    },
    energy_penalty_total: {
        type: Number,
        required: true
    }
}, { _id: false });

const TransactionLog = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fee: {
        type: Number,
        required: true
    },
    blockNumber: {
        type: Number,
        required: true
    },
    blockTimeStamp: {
        type: Number,
        required: true
    },
    contractResult: {
        type: [String],
        required: true
    },
    contract_address: {
        type: String,
        required: true,
        trim: true
    },
    receipt: {
        type: ReceiptSchema,
        required: true
    },
    log: {
        type: [LogSchema],
        required: true
    },
    hash: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    network: {
        type: String,
    }
});

module.exports = mongoose.model('TransactionLog', TransactionLog);
