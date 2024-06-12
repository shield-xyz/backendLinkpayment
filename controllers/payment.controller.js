const Payment = require('../models/payment.model');

const PaymentController = {
    async createPayment(data) {
        const payment = new Payment(data);
        await payment.save();
        return payment;
    },

    async getPayments() {
        const payments = await Payment.find();
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
    }
};

module.exports = PaymentController;
