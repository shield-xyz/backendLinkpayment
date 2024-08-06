const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientsAddressSchema = new Schema({
    name: {
        type: String,
    },
    userId: {
        type: String,
    },
    wallets: {
        type: [String],
    },
    groupIdWpp: String,
});

module.exports = mongoose.model('ClientsAddress', ClientsAddressSchema);