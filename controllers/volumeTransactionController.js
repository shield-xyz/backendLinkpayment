const volumeTransactionModel = require("../models/volumeTransactionModel");
const VolumeTransaction = require("../models/volumeTransactionModel");

const VolumeTransactionController = {
  async createTransaction(data) {
    const transaction = new VolumeTransaction(data);
    await transaction.save();
    return transaction;
  },

  async getTransactions() {
    const transactions = await VolumeTransaction.find()
      .select("tx date receivedAmount symbol")
      .sort({ date: 1 });

    const monthlyTransactions = transactions.reduce((acc, transaction) => {
      const month = transaction.date.getMonth() + 1;
      const monthStr = month < 10 ? `0${month}` : `${month}`;
      const year = transaction.date.getFullYear();
      const key = `${year}-${monthStr}`;
      if (acc[key]) {
        acc[key] += transaction.receivedAmount;
      } else {
        acc[key] = transaction.receivedAmount;
      }
      return acc;
    }, {});

    const result = Object.keys(monthlyTransactions).map((key) => {
      return {
        month: key,
        totalReceivedAmount: monthlyTransactions[key],
      };
    });

    // Now, get the cumulative sum for each month
    let cumulativeSum = 0;
    const cumulativeResults = result.map((transaction) => {
      cumulativeSum += transaction.totalReceivedAmount;
      return {
        name: transaction.month,
        amt: Math.round(cumulativeSum),
      };
    });

    // Get only transactions from last 6 months
    const currentDate = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

    return cumulativeResults.filter((transaction) => {
      const transactionDate = new Date(transaction.name);
      return transactionDate >= sixMonthsAgo;
    });
  },
  async getAllTransactions() {
    const transactions = await VolumeTransaction.find().sort({ date: -1 });
    return transactions;
  },

  async getTransactionById(id) {
    const transaction = await VolumeTransaction.findById(id);
    return transaction;
  },

  async updateTransaction(filter, data) {
    const transaction = await VolumeTransaction.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    return transaction;
  },

  async deleteTransaction(filter) {
    const transaction = await VolumeTransaction.findByIdAndDelete(filter);
    return transaction;
  },
  async getTotalReceivedAmountByDay() {
    const results = await VolumeTransaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          totalReceivedAmount: { $sum: "$receivedAmount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return results.map((result) => {
      return {
        date: `${result._id.year}-${result._id.month}-${result._id.day}`,
        totalReceivedAmount: result.totalReceivedAmount,
      };
    });
  },
  async getTotalReceivedAmountByMonth() {
    const results = await VolumeTransaction.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          totalReceivedAmount: { $sum: "$receivedAmount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return results.map((result) => ({
      date: `${result._id.year}-${result._id.month}`,
      totalReceivedAmount: result.totalReceivedAmount,
    }));
  },
  async getCumulativeSumByDay() {
    try {
      const transactions = await VolumeTransaction.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            dailySum: { $sum: "$receivedAmount" },
          },
        },
        { $sort: { _id: 1 } }, // Ordenar por fecha
      ]);

      let cumulativeSum = 0;
      const cumulativeResults = transactions.map((transaction) => {
        cumulativeSum += transaction.dailySum;
        return {
          date: transaction._id,
          dailySum: transaction.dailySum,
          totalReceivedAmount: cumulativeSum,
        };
      });

      return cumulativeResults;
    } catch (error) {
      return error;
    }
  },
};

module.exports = VolumeTransactionController;
