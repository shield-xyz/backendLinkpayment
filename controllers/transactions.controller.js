const Transaction = require('../models/transaction.model');

const TransactionController = {
  async createTransaction(data) {
    try {
      const transaction = new Transaction(data);
      await transaction.save();
      return transaction;
    } catch (error) {
      return error.message;
    }
  },

  async getTransactions(filter = {}) {
    try {
      const transactions = await Transaction.find(filter);
      return transactions;
    } catch (error) {
      return error.message;
    }
  },

  async getTransactionById(id) {
    try {
      const transaction = await Transaction.findById(id);
      return transaction;
    } catch (error) {
      return error.message;
    }
  },

  async updateTransaction(id, data) {
    try {
      const transaction = await Transaction.findByIdAndUpdate(id, data, { new: true });
      return transaction;
    } catch (error) {
      return error.message;
    }
  },

  async deleteTransaction(id) {
    try {
      const transaction = await Transaction.findByIdAndDelete(id);
      return transaction;
    } catch (error) {
      return error.message;
    }
  }
};

module.exports = TransactionController;
