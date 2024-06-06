const { Schema, model } = require('mongoose');

const BlockchainSchema = new Schema(
  {
    chain: { type: String, required: true, unique: true },
    chainId: { type: Number, required: false },
    chainType: { type: String, required: true },
    mainnet: { type: Boolean, required: true },
    nativeSymbol: { type: String, required: true },
    wallets: [{ type: Schema.Types.ObjectId, ref: 'wallets' }],
  },
  {
    collection: 'blockchains',
    timestamps: true,
  }
);

module.exports = model('blockchains', BlockchainSchema);
