const { Schema, model } = require('mongoose');

const BalanceSchema = new Schema(
  {
    amount: { type: Number, required: true },
    networkId: {
      type: String,
      required: true,
      ref: "Network"
    },
    assetId: { type: String, required: true, ref: "Asset" },
    userId: {
      type: String,
      ref: "User",
      required: true,
    }
  },
  {
    collection: 'balances',
    timestamps: true,
  }
);

// Crear un índice compuesto único
BalanceSchema.index({ userId: 1, assetId: 1, blockchain: 1 }, { unique: true });

module.exports = model('Balance', BalanceSchema);
