const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    created_on: {
        type: Date,
        default: Date.now,
    },
    base_amount: {
        type: Number,
        required: true,
    },
    quote_amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        required: true,
        trim: true,
    },
    return_url: {
        type: String,
        trim: true,
    },
    assetId: {
        type: String,
        trim: true,
        default: "",
        ref: "Asset"
    },
    userId: {
        type: String,
        required: true,
        trim: true,
        ref: "User"
    },
    hash: {
        type: String,
        trim: true,
    },
    balanceImported: {
        type: Boolean,
        default: false,
    }
});
PaymentSchema.virtual('asset', {
    ref: 'Asset', // The model to use
    localField: 'assetId', // Find people where `localField`
    foreignField: 'assetId', // is equal to `foreignField`,
    justOne: true
});

module.exports = mongoose.model('Payment', PaymentSchema);