const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OffRampModelSchema = new Schema({
    offrampId: { type: String, required: true },
    feeDetail: {
        rate_amount: { type: Number, required: true },
        total_fee_amount: { type: Number, required: true },
        total_fee_amount_in_currency: { type: Number, required: true }
    },
    sender: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        walletAddress: { type: String, default: '-' }
    },
    receiver: {
        id: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        accountNumber: { type: String, required: true },
        achNumber: { type: String, required: true },
        city: { type: String, required: true },
        address: { type: String, required: true },
        postCode: { type: String, required: true }
    },
    inputAmount: { type: Number, required: true },
    inputAmountExact: { type: Number, required: true },
    inputCurrency: { type: String, required: true },
    outputCurrency: { type: String, required: true },
    outputAmount: { type: Number, required: true },
    outputAmountExact: { type: Number, required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, required: true },
    organizationId: { type: String, required: true },
    blockchain: { type: String, required: true },
    payOutWallet: { type: String, required: true },
    expiredDate: { type: Date, required: true },
    cryptoId: { type: String, required: true },
    useSmartContract: { type: Boolean, required: true },
    blockchainType: { type: String, required: true },
    activityHistory: [{ type: Schema.Types.Mixed }],
    reference: { type: String, default: '' },
    adminNotesActivities: { type: Array, default: [] },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
    id: { type: String, required: true },
    userId: { type: String, required: true },
    withdrawId: { type: String, required: true },
    tx: { type: Object }
});

const OffRampModel = mongoose.model('OffRamp', OffRampModelSchema);

module.exports = OffRampModel;

