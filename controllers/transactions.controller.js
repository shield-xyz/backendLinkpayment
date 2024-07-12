const Transaction = require("../models/transaction.model");

const TransactionController = {
  async createTransaction(data) {
    try {
      const transaction = new Transaction(data);
      await transaction.save();
      return transaction;

      // Template logger for logging transaction amount and timestamp

      // logger.info(
      //   `Transaction Total Amount: $${total.amount}, Date: $${new Date()}, Currency: `
      // );
    } catch (error) {
      return error.message;
    }
  },

  async getTransactions(filter = {}) {
    try {
      const transactions = await Transaction.find(filter)
        .populate({ path: "network", select: "-deposit_address" })
        .populate("asset");

      // Template logger for getting total volume of transactions processed

      // const total = transactions.reduce((prev, transaction) => {

      //   // Formula for getting total profit

      //   // Define the transaction fee rate (e.g., 2.5%) eg.
      //   const feeRate = 0.025;

      //   return {
      //     volume: prev.volume + transaction.amount,
      //     profit: prev.profit + transaction.amount * feeRate
      //   }
      // }, {
      //   volume: 0,
      //   profit: 0
      // })

      // logger.info(
      //   `Transaction Total Volume: $${total.volume}, Profit: $${total.profit}`
      // );

      return transactions.map((x) => x.toObject());
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
      const transaction = await Transaction.findByIdAndUpdate(id, data, {
        new: true,
      });
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
  },
};

module.exports = TransactionController;
