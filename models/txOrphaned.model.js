const mongoose = require('mongoose');
const { Schema } = mongoose;

const TxOrphanedSchema = new Schema(
  {
    amount: { type: mongoose.Schema.Types.Mixed, required: true },
    blockNumber: { type: Number, required: true },
    chain: { type: String, required: true },
    currency: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    txHash: { type: String, required: true, unique: true, index: true },
  },
  {
    collection: 'txOrphaned',
    timestamps: true,
  }
);

const TxOrphanedModel = mongoose.model('TxOrphaned', TxOrphanedSchema);

module.exports = TxOrphanedModel;
