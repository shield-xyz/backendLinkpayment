// services/transactionService.js
const Transaction = require('../models/Transaction');

const getTransactions = async () => {
    return await Transaction.find();
};

const getTransactionById = async (id) => {
    return await Transaction.findById(id);
};

const createTransaction = async (transactionData) => {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
};

const updateTransaction = async (id, transactionData) => {
    return await Transaction.findByIdAndUpdate(id, transactionData, { new: true });
};

const deleteTransaction = async (id) => {
    return await Transaction.findByIdAndDelete(id);
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
};
