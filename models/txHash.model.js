const { Schema, model } = require('mongoose');

const TxHash = new Schema(
  {
    blockchain: {
      type: Schema.Types.ObjectId,
      ref: 'blockchains',
      required: true,
    },
    identificationDate: { type: Date, required: true },
    txHash: { type: String, required: true },
  },
  {
    collection: 'txHashes',
    timestamps: true,
  }
);

module.exports = model('txHashes', TxHash);
