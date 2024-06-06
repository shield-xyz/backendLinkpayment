const { TransactionsService } = require('../services');
const { handleHttpError } = require('../utils');
const TransactionModel = require('../models/transaction.model');

const TransactionsController = {
  async getAllTransactions(req, res) {
    try {
      const transactions = await TransactionModel.find();
      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getByCurrentUserFromRamp(req, res) {
    try {
      const userId = req.body.user.id;
      const transactions = await TransactionsService.findFromRamp(userId);
      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async getNotSyncedByCurrentUser(req, res) {
    try {
      const userId = req.body.user.id;
      const transactions = await TransactionsService.notSynced(userId);
      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async syncByCurrentUser(req, res) {
    try {
      const userId = req.body.user.id;
      const transactions = await TransactionsService.syncTransactions(userId);

      if (transactions.numberOfTransactions === 0) {
        return res.send({ message: 'No new transactions found' });
      }

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async syncMockTransactionsByCurrentUser(req, res) {
    try {
      const userId = req.body.user.id;
      const data = req.body.transactions;

      if (!data || !data.length) {
        return res.send({ message: 'No transactions provided' });
      }

      const transactions = await TransactionsService.syncMockTransactions(userId, data);

      if (transactions.numberOfTransactions === 0) {
        return res.send({ message: 'No new transactions found' });
      }

      res.send(transactions);
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

module.exports = TransactionsController;
