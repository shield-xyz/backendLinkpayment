const LinkPayment = require('../models/LinkPayment');
const balanceModel = require('../models/balance.model');
const Payment = require('../models/payment.model');

const PaymentController = {
    async createPayment(data) {
        const payment = new Payment(data);
        await payment.save();
        return payment;
    },

    async getPayments(filter = {}) {
        const payments = await Payment.find(filter).populate("asset");
        return payments;
    },
    async getOne(filter) {
        const payments = await Payment.findOne(filter);
        return payments;
    },
    async findId(id) {
        const payment = await Payment.findById(id);
        return payment;
    },

    async updatePayment(filter, data) {
        const payment = await Payment.findOneAndUpdate(filter, data, { new: true, runValidators: true });
        return payment;
    },

    async deletePayment(id) {
        const payment = await Payment.findByIdAndDelete(id);
        return payment;
    },
    async loadBalanceImported(idPayment) {
        let payment = await Payment.findById(idPayment).populate("asset");
        // console.log(payment.asset, "payment");
        if (payment.balanceImported == false) {
            let balance = await balanceModel.findOne({ userId: payment.userId, assetId: payment.assetId })
            if (!balance) {
                balance = new balanceModel({
                    amount: 0,
                    networkId: payment.asset.networkId,
                    assetId: payment.assetId,
                    userId: payment.userId,
                })
            }
            balance.amount += payment.quote_amount;
            balance.save();
            payment.balanceImported = true;
            payment.save();
        }
    },
    async loadBalanceImportedLinkPayment(payment) {
        // let payment = await LinkPayment.findOne({ id: idLink }).populate("asset");
        // console.log(payment.asset, "payment");
        if (payment.balanceImported == false) {
            let balance = await balanceModel.findOne({ userId: payment.merchantId, assetId: payment.assetId })
            if (!balance) {
                balance = new balanceModel({
                    amount: 0,
                    networkId: payment.asset.networkId,
                    assetId: payment.assetId,
                    userId: payment.merchantId,
                })
            }
            balance.amount += payment.amount;
            await balance.save();
            payment.balanceImported = true;
            await payment.save();
        }
    }
};

module.exports = PaymentController;
