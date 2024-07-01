const Withdraw = require('../models/withdraws.model');

const WithdrawController = {
    async createWithdraw(data) {
        const withdraw = new Withdraw(data);
        await withdraw.save();
        return withdraw;
    },

    async getWithdraws(filter = {}) {
        const withdraws = await Withdraw.find(filter).populate("asset user");
        return withdraws;
    },

    async getWithdrawById(id) {
        const withdraw = await Withdraw.findById(id);
        return withdraw;
    },

    async updateWithdraw(id, data) {
        const withdraw = await Withdraw.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return withdraw;
    },

    async deleteWithdraw(id) {
        const withdraw = await Withdraw.findByIdAndDelete(id);
        return withdraw;
    }
};

module.exports = WithdrawController;
