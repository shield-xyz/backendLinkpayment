const { Schema, model } = require('mongoose');

const CryptoDeductionSchema = new Schema({
  amount: { type: Number, required: true },
  balance: { type: Schema.Types.ObjectId, required: true },
  exchangeRate: { type: Number, required: true },
  ticker: { type: String, required: true },
  usdValue: { type: Number, required: true },
});

const TransactionSchema = new Schema(
  {
    crypto_deductions: [CryptoDeductionSchema],
    ramp_amount: { type: Number, required: true },
    ramp_currency_code: { type: String, required: true },
    ramp_transaction_id: { type: String, required: true, index: true },
    ramp_user_transaction_time: { type: String, required: true },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
  },
  {
    collection: 'transactions',
    timestamps: true,
  }
);

module.exports = model('transactions', TransactionSchema);
