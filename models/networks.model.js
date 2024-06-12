const mongoose = require('mongoose');

const NetworkSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        // trim: true,
    },
    logo: {
        type: String,
        trim: true,
    },
    deposit_address: {
        type: String,
        trim: true,
    },
    networkId: {
        type: String,
        required: true,
        unique: true,
    },
});

module.exports = mongoose.model('Network', NetworkSchema);
