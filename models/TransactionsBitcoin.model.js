const mongoose = require('mongoose');

const inputSchema = new mongoose.Schema({
    prev_hash: { type: String },
    output_index: { type: Number },
    output_value: { type: Number },
    sequence: { type: Number },
    addresses: { type: [String] },
    script_type: { type: String },
    age: { type: Number },
    witness: { type: [String] }
}, { _id: false });

const outputSchema = new mongoose.Schema({
    value: { type: Number },
    script: { type: String },
    addresses: { type: [String] },
    script_type: { type: String },
    data_hex: { type: String }
}, { _id: false });

const transactionsBitcoinSchema = new mongoose.Schema({
    block_height: { type: Number, default: -1 },
    block_index: { type: Number, default: -1 },
    hash: { type: String, required: true, unique: true },
    addresses: { type: [String], required: true },
    total: { type: Number },
    fees: { type: Number },
    size: { type: Number },
    vsize: { type: Number },
    preference: { type: String },
    relayed_by: { type: String },
    received: { type: Date },
    ver: { type: Number },
    double_spend: { type: Boolean },
    vin_sz: { type: Number },
    vout_sz: { type: Number },
    opt_in_rbf: { type: Boolean },
    data_protocol: { type: String },
    confirmations: { type: Number },
    inputs: [inputSchema],
    outputs: [outputSchema],
    network: { type: String, },
    totalBTC: { type: Number },
    applied: { type: Boolean, default: false },
    paymentId: String,
    linkpaymentId: String,
});

const TransactionsBitcoin = mongoose.model('TransactionsLogsBitcoin', transactionsBitcoinSchema);

module.exports = TransactionsBitcoin;
