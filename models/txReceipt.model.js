const { Schema, model } = require('mongoose');


const TxReceipt = new Schema(
  {
    amount: { type: String, required: true },
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
    blockNumber: { type: Number, required: true },
    exchangeRate: { type: Number, required: true },
    from: { type: String, required: true },
    identificationDate: { type: Date, required: true },
    to: { type: String, required: true },
    txHash: { type: String, required: true, unique: true, index: true },
    usdValue: { type: Number, required: true },
  },
  {
    collection: 'txReceipts',
    timestamps: true,
  }
);

module.exports = model('txReceipts', TxReceipt);
