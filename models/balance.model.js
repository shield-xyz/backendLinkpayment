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
BalanceSchema.virtual('user', {
  ref: 'User', // The model to use
  localField: 'userId', // Find people where `localField`
  foreignField: '_id', // is equal to `foreignField`,
  justOne: true
});
BalanceSchema.virtual('asset', {
  ref: 'Asset', // The model to use
  localField: 'assetId', // Find people where `localField`
  foreignField: 'assetId', // is equal to `foreignField`,
  justOne: true
});
BalanceSchema.virtual('network', {
  ref: 'Network', // The model to use
  localField: 'networkId', // Find people where `localField`
  foreignField: 'networkId', // is equal to `foreignField`,
  justOne: true
});
BalanceSchema.set('toObject', { virtuals: true });

module.exports = model('Balance', BalanceSchema);
