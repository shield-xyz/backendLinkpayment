const mongoose = require('mongoose');
const crypto = require('crypto');

const ClientSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
    },
    // apiKey: {
    //     type: String,
    //     unique: true,
    // }
});

ClientSchema.pre('save', function (next) {
    // if (!this.apiKey) {
    //     // this.apiKey = crypto.randomBytes(16).toString('hex');
    // }
    next();
});

module.exports = mongoose.model('Client', ClientSchema);
