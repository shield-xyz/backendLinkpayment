const { Schema, model } = require('mongoose');

const walletSchema = new Schema(
  {
    address: { type: String, required: true, unique: true },
    blockchains: [{ type: Schema.Types.ObjectId, ref: 'blockchains' }],
    date: { type: Date, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  {
    collection: 'wallets',
    timestamps: true,
  }
);

module.exports = model('wallets', walletSchema);
