// models/Merchant.js
const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    assetId: {
        type: String,
        required: true,
        unique: true,

    },
    symbol: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,

    },
    decimals: {
        type: Number,
        required: true,
    },
    logo: {
        type: String,
        trim: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    networkId: {
        type: String,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },

});

module.exports = mongoose.model('Asset', AssetSchema);
