const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: true,
    ref: "Asset"
  },
  networkId: {
    type: String,
    required: true,
    ref: "Network"
  },
  linkPaymentId: {
    type: String,
    ref: "LinkPayment"
  },
  paymentId: {
    type: String,
  },
  userId: {
    type: String,
    ref: "User"
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  hash: {
    type: String,
    required: true
  }
});


module.exports = mongoose.model('transactions', transactionSchema);
