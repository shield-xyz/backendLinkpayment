const Account = require('../models/account.model');

const AccountController = {
    async createAccount(data) {
        const account = new Account(data);
        await account.save();
        return account;
    },

    async getAccounts() {
        const accounts = await Account.find();
        return accounts;
    },

    async getAccountById(id) {
        const account = await Account.findById(id);
        return account;
    },

    async updateAccount(filter, data) {
        const account = await Account.findOneAndUpdate(filter, data, { new: true, runValidators: true });
        return account;
    },

    async deleteAccount(filter) {
        const account = await Account.findByIdAndDelete(filter);
        return account;
    }
};

module.exports = AccountController;
