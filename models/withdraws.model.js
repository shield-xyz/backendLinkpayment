const mongoose = require('mongoose');

const WithdrawSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true,
    },
    assetId: {
        type: String,
        required: true,
        ref: "Asset"
    },
    accountId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
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
    offRampId: { type: String, }
});

WithdrawSchema.virtual('asset', {
    ref: 'Asset', // The model to use
    localField: 'assetId', // Find people where `localField`
    foreignField: 'assetId', // is equal to `foreignField`,
    justOne: true
});
WithdrawSchema.virtual('user', {
    ref: 'User', // The model to use
    localField: 'userId', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`,
    justOne: true
});

module.exports = mongoose.model('Withdraw', WithdrawSchema);
