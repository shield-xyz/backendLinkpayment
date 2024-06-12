const TransactionLog = require('../models/transactionsLog.model');

const TransactionLogController = {
    async createTransaction(data) {
        try {
            const transactionLog = new TransactionLog(data);
            await transactionLog.save();
            return transactionLog;
        } catch (error) {
            if (error.code === 11000) {
                console.log('Duplicate key error:', error);
                throw new Error('TransactionLog with this id already exists');
            } else {
                throw error;
            }
        }
    },

    async getTransactions() {
        return await TransactionLog.find();
    },

    async getTransactionById(id) {
        return await TransactionLog.findOne({ id });
    },
    async findOne(filter) {
        return await TransactionLog.findOne(filter);
    },

    async updateTransaction(id, data) {
        const transactionLog = await TransactionLog.findOneAndUpdate({ id }, data, { new: true, upsert: true });
        return transactionLog;
    },

    async deleteTransaction(id) {
        return await TransactionLog.findOneAndDelete({ id });
    }
};

module.exports = TransactionLogController;
