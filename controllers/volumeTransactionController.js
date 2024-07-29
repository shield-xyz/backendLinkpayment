const VolumeTransaction = require('../models/volumeTransactionModel');

const VolumeTransactionController = {
    async createTransaction(data) {
        const transaction = new VolumeTransaction(data);
        await transaction.save();
        return transaction;
    },

    async getTransactions() {
        const transactions = await VolumeTransaction.find().select("tx date receivedAmount symbol");
        return transactions;
    },
    async getAllTransactions() {
        const transactions = await VolumeTransaction.find();
        return transactions;
    },

    async getTransactionById(id) {
        const transaction = await VolumeTransaction.findById(id);
        return transaction;
    },

    async updateTransaction(filter, data) {
        const transaction = await VolumeTransaction.findOneAndUpdate(filter, data, { new: true, runValidators: true });
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
                        day: { $dayOfMonth: "$date" }
                    },
                    totalReceivedAmount: { $sum: "$receivedAmount" }
                }
            },
            {
                $sort: { "_id": 1 }
            }
        ]);

        return results.map(result => {
            return {
                date: `${result._id.year}-${result._id.month}-${result._id.day}`,
                totalReceivedAmount: result.totalReceivedAmount
            }
        });
    },
    async getTotalReceivedAmountByMonth() {
        const results = await VolumeTransaction.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalReceivedAmount: { $sum: "$receivedAmount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        return results.map(result => ({
            date: `${result._id.year}-${result._id.month}`,
            totalReceivedAmount: result.totalReceivedAmount
        }));
    }
};

module.exports = VolumeTransactionController;
