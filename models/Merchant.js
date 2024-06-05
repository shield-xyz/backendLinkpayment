// models/Merchant.js
const mongoose = require('mongoose');

const MerchantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        trim: true,
    },
    url: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Merchant', MerchantSchema);
