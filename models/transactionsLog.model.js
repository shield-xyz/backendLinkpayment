const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Trc20TransferInfoSchema = new Schema({
    icon_url: String,
    symbol: String,
    level: String,
    to_address: String,
    contract_address: String,
    type: String,
    decimals: Number,
    name: String,
    vip: Boolean,
    tokenType: String,
    from_address: String,
    amount_str: String,
    status: Number
}, { _id: false });

const CostSchema = new Schema({
    net_fee_cost: Number,
    date_created: Number,
    fee: Number,
    energy_fee_cost: Number,
    net_usage: Number,
    multi_sign_fee: Number,
    net_fee: Number,
    energy_penalty_total: Number,
    energy_usage: Number,
    energy_fee: Number,
    energy_usage_total: Number,
    memoFee: Number,
    origin_energy_usage: Number
}, { _id: false });

const SrConfirmListSchema = new Schema({
    address: String,
    name: String,
    block: Number,
    url: String,
}, { _id: false });

const TransactionLogsSchema = new Schema({
    contract_map: { type: Map, of: Boolean },
    contractRet: String,
    data: { type: String },  // Campo oculto
    contractInfo: {
        type: Map, of: new Schema({
            isToken: Boolean,
            tag1: String,
            tag1Url: String,
            name: String,
            risk: Boolean,
            vip: Boolean
        }, { _id: false })
    },
    contractType: Number,
    event_count: Number,
    project: String,
    toAddress: String,
    confirmed: Boolean,
    trc20TransferInfo: [Trc20TransferInfoSchema],
    transfersAllList: [Trc20TransferInfoSchema],
    block: Number,
    triggerContractType: Number,
    riskTransaction: Boolean,
    timestamp: Number,
    info: Object,
    normalAddressInfo: { type: Map, of: new Schema({ risk: Boolean }, { _id: false }) },
    cost: { type: [CostSchema], select: false },
    noteLevel: Number,
    addressTag: { type: Map, of: String },
    revert: Boolean,
    confirmations: Number,
    fee_limit: Number,
    tokenTransferInfo: Trc20TransferInfoSchema,
    contract_type: String,
    trigger_info: new Schema({
        method: String,
        parameter: { type: Map, of: String },
        methodId: String,
        contract_address: String,
        call_value: Number
    }, { _id: false }),
    signature_addresses: [String],
    ownerAddress: String,
    srConfirmList: { type: [SrConfirmListSchema], select: false },
    contractData: new Schema({
        data: { type: String, select: false }, // Campo oculto
        owner_address: String,
        contract_address: String
    }, { _id: false }),
    internal_transactions: Object,
    hash: String,
    network: String,
    paymentId: String,
    linkpaymentId: String,
    applied: { type: Boolean, default: false }

});


module.exports = mongoose.model('TransactionLogs', TransactionLogsSchema);
