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
        default: ""
    },
    clientId: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: String,
        required: true,
        trim: true,
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);