const mongoose = require('mongoose');

const walletNetworkUserSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    networkId: { type: String, required: true, ref: "Network" },
    address: { type: String, required: true }
});

const WalletNetworkUser = mongoose.model('WalletNetworkUser', walletNetworkUserSchema);

module.exports = WalletNetworkUser;
