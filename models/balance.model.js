const { Schema, model } = require('mongoose');

const BalanceSchema = new Schema(
  {
    amount: { type: Number, required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
    currency: { type: String, required: true },
    date: { type: Date, required: true },
    txHash: { type: String, required: true },
    wallet: { type: Schema.Types.ObjectId, ref: 'wallets', required: true },
  },
  {
    collection: 'balances',
    timestamps: true,
  }
);

module.exports = model('balances', BalanceSchema);
