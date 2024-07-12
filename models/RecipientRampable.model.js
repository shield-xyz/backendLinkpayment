const mongoose = require('mongoose');

const recipientRampableSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    recipientType: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    bank: [
        {
            accountName: String,
            bankName: String,
            accountNumber: Number,
            paymentCode: String,
            currency: String,
            country: String,
            achNumber: String,
            fedwireNumber: String,
            ibanNumber: String,
            accountType: String,
            _id: String
        }
    ],
    organizationId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    address: String,
    city: String,
    postCode: String,
    reference: String,
    id: {
        type: String,
        required: true
    }
});

const RecipientRampableModel = mongoose.model('RecipientRampable', recipientRampableSchema);

module.exports = RecipientRampableModel;
