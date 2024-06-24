const TransactionsBitcoin = require('../models/TransactionsBitcoin.model');

const TransactionsBitcoinController = {
    async createTransaction(data) {
        try {
            const transaction = new TransactionsBitcoin(data);
            await transaction.save();
            return transaction;
        } catch (error) {
            return error.message;
        }
    },

    async getTransactions(filter = {}) {
        try {
            const transactions = await TransactionsBitcoin.find(filter);
            return transactions;
        } catch (error) {
            return error.message;
        }
    },

    async getTransactionById(id) {
        try {
            const transaction = await TransactionsBitcoin.findById(id);
            return transaction;
        } catch (error) {
            return error.message;
        }
    },

    async updateTransaction(id, data) {
        try {
            const transaction = await TransactionsBitcoin.findByIdAndUpdate(id, data, { new: true });
            return transaction;
        } catch (error) {
            return error.message;
        }
    },

    async deleteTransaction(id) {
        try {
            const transaction = await TransactionsBitcoin.findByIdAndDelete(id);
            return transaction;
        } catch (error) {
            return error.message;
        }
    }
};

module.exports = TransactionsBitcoinController;
