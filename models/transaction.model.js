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
transactionSchema.virtual('asset', {
  ref: 'Asset', // The model to use
  localField: 'assetId', // Find people where `localField`
  foreignField: 'assetId', // is equal to `foreignField`
  justOne: true
});
transactionSchema.virtual('network', {
  ref: 'Network', // The model to use
  localField: 'networkId', // Find people where `localField`
  foreignField: 'networkId', // is equal to `foreignField`
  justOne: true
});
transactionSchema.virtual('user', {
  ref: 'User', // The model to use
  localField: 'userId', // Find people where `localField`
  foreignField: '_id', // is equal to `foreignField`
  justOne: true
});
transactionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('transactions', transactionSchema);
