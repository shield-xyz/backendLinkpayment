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

    async updateAccount(id, data) {
        const account = await Account.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        return account;
    },

    async deleteAccount(id) {
        const account = await Account.findByIdAndDelete(id);
        return account;
    }
};

module.exports = AccountController;
