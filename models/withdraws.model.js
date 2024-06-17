const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    balanceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Balance',
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Withdraw', WithdrawSchema);
