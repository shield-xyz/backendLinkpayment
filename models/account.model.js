const mongoose = require('mongoose');
const AccountSchema = new mongoose.Schema({
    bankName: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    routingNumber: {
        type: String,
        required: true,
    },
    accountType: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    selected: {
        type: Boolean,
        default: false,
    }
});

module.exports = mongoose.model('Account', AccountSchema);
