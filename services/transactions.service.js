const mongoose = require('mongoose');
const logger = require('node-color-log');


const {
  getHistoricPrice,
  getRampToken,
  getRampUserId,
  handleError,
  validateResponse,
  getAllExchangeRates,
  buildSyncResponse,
} = require('../utils');
const { RAMP_API_URL, Token } = require('../config');
const TransactionModel = require('../models/transaction.model');
const BalanceModel = require('../models/balance.model');
const { BalanceService } = require('./balance.service');

class TransactionsService {
  static async findFromRamp(userId) {
    try {
      const [token, rampUserId] = await Promise.all([
        getRampToken(),
        getRampUserId(userId),
      ]);

      const transactionsEndpoint = `${RAMP_API_URL}/transactions?user_id=${rampUserId}&order_by_date_desc=true`;

      const response = await fetch(transactionsEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      validateResponse(
        response,
        `Failed to fetch transactions from ramp for user ${userId}`
      );

      const data = await response.json();
      const transactions = data.data;

      return transactions;
    } catch (error) {
      handleError(
        error,
        `Failed to find transactions from ramp for user ${userId}`
      );
    }
  }

  static async notSynced(userId) {
    try {
      const transactions = await this.findFromRamp(userId);

      const newTransactions = await TransactionModel.find({
        ramp_transaction_id: { $in: transactions.map((t) => t.id) },
      });

      const notFoundTransactions = transactions.filter(
        (t) => !newTransactions.some((nt) => nt.ramp_transaction_id === t.id)
      );

      return notFoundTransactions;
    } catch (error) {
      handleError(
        error,
        `Failed to find new transactions from ramp for user ${userId}`
      );
    }
  }

  static async updateUserBalances(
    rampTransaction,
    userId,
    exchangeRates,
    session
  ) {
    try {
      const userBalances = await BalanceService.getBalancesByUserId(userId);

      const cryptoDeductions = [];
      let amountToDecreaseInUSD = rampTransaction.amount;

      for (const _balance of userBalances) {
        if (amountToDecreaseInUSD <= 0) {
          break;
        }

        const userBalances = await BalanceService.getBalancesAndUSD(
          userId,
          exchangeRates
        );

        const { balance: higherBalance } = userBalances.reduce(
          (acc, balance) => {
            if (balance.usdEquivalent > acc.usdEquivalent) {
              return balance;
            }
            return acc;
          }
        );

        const exchangeRate = await getHistoricPrice(
          higherBalance.currency,
          rampTransaction.user_transaction_time
        );

        if (!exchangeRate) {
          throw new Error(
            `Failed to get exchange rate for ${higherBalance.currency} at ${rampTransaction.user_transaction_time}`
          );
        }

        const cryptoToDecrease = rampTransaction.amount / exchangeRate;

        const cryptoDeduction = {
          amount: cryptoToDecrease,
          balance: higherBalance._id,
          exchangeRate: exchangeRate,
          ticker: higherBalance.currency,
          usdValue: cryptoToDecrease * exchangeRate,
        };

        cryptoDeductions.push(cryptoDeduction);
        amountToDecreaseInUSD -= cryptoDeduction.usdValue;

        await BalanceModel.findOneAndUpdate(
          { _id: higherBalance._id },
          { $inc: { amount: -cryptoToDecrease } },
          { session }
        );
      }

      if (cryptoDeductions.length === 0) {
        throw new Error('No balances were updated');
      }

      return cryptoDeductions;
    } catch (error) {
      handleError(
        error,
        `Failed to update user balances for user ${userId} and transaction ${rampTransaction.id}`
      );
    }
  }

  // Here we insert the transaction in the db and we decrease the user balance
  static async insertTransaction(
    rampTransaction,
    exchangeRates,
    userId
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const existingTransaction = await TransactionModel.findOne({
        ramp_transaction_id: rampTransaction.id,
      });

      if (existingTransaction) {
        throw new Error(
          `Transaction with rampId: ${rampTransaction.id} already exists`
        );
      }

      const cryptoDeductions = await this.updateUserBalances(
        rampTransaction,
        userId,
        exchangeRates,
        session
      );

      const transaction = {
        ramp_amount: rampTransaction.amount,
        ramp_currency_code: rampTransaction.currency_code,
        ramp_transaction_id: rampTransaction.id,
        ramp_user_transaction_time: rampTransaction.user_transaction_time,
        user: userId,
        crypto_deductions: cryptoDeductions,
      };

      const newTransaction = await TransactionModel.create([transaction], {
        session,
      });

      await session.commitTransaction();

      logger.info(
        `Transaction of rampId: ${rampTransaction.id} synced successfully`
      );

      return newTransaction[0];
    } catch (error) {
      session.abortTransaction();
      handleError(
        error,
        `Failed to insert transaction of rampId: ${rampTransaction.id}`
      );
    } finally {
      session.endSession();
    }
  }

  static async syncTransactions(userId) {
    try {
      const [notSyncedTransactions, exchangeRates] = await Promise.all([
        this.notSynced(userId),
        getAllExchangeRates(),
      ]);

      const savedTransactions = [];

      for (const t of notSyncedTransactions) {
        const savedTransaction = await this.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const response = buildSyncResponse(
        savedTransactions,
        notSyncedTransactions
      );
      return response;
    } catch (error) {
      handleError(
        error,
        `Failed to sync transactions from ramp for user ${userId}`
      );
    }
  }

  static async syncMockTransactions(
    userId,
    rampTransactions
  ) {
    try {
      const exchangeRates = await getAllExchangeRates();

      const savedTransactions = [];

      for (const t of rampTransactions) {
        const savedTransaction = await this.insertTransaction(
          t,
          exchangeRates,
          userId
        );
        savedTransactions.push(savedTransaction);
      }

      const response = buildSyncResponse(savedTransactions, rampTransactions);
      return response;
    } catch (error) {
      handleError(
        error,
        `Failed to sync mock transactions from ramp for user ${userId}`
      );
    }
  }
}

module.exports = { TransactionsService };
