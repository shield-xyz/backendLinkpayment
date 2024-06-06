const { ClientSession } = require('mongoose');

const BalanceModel = require('../models/balance.model');
const BlockchainModel = require('../models/blockchain.model');
const WalletModel = require('../models/wallet.model');
const TxOrphanedModel = require('../models/txOrphaned.model');
const { getAllExchangeRates, handleError } = require('../utils');

class BalanceService {
  static async getBalancesByUserId(userId, session) {
    try {
      const wallets = await WalletModel.find({ user: userId }).session(
        session ?? null
      );

      const walletIds = wallets.map((wallet) => wallet._id);

      const balances = await BalanceModel.find({
        wallet: { $in: walletIds },
      })
        .populate('wallet')
        .populate('blockchain')
        .session(session ?? null);

      return balances;
    } catch (error) {
      handleError(error, `Failed to get balances for user ${userId}`);
    }
  }

  static async getTotalUSDUserBalance(userId, session) {
    try {
      const balances = await this.getBalancesByUserId(userId, session);
      const prices = await getAllExchangeRates();

      const totalBalance = balances.reduce((acc, balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.currency) || {};
        return acc + balance.amount * price;
      }, 0);

      return totalBalance;
    } catch (error) {
      handleError(
        error,
        `Failed to get total balance in USD for user ${userId}`
      );
    }
  }

  static async getBalancesAndUSD(userId, prices) {
    try {
      const balances = await this.getBalancesByUserId(userId);

      const balancesWithUSDEquivalents = balances.map((balance) => {
        const { price = 0 } =
          prices.find((price) => price.name === balance.currency) || {};

        return {
          balance,
          usdEquivalent: balance.amount * price,
        };
      });

      if (balancesWithUSDEquivalents.length < 1) {
        throw new Error(`No balances found for user ${userId}`);
      }

      return balancesWithUSDEquivalents;
    } catch (error) {
      handleError(
        error,
        `Failed to get balances and USD equivalents for user ${userId}`
      );
    }
  }

  static async updateInside(data, session) {
    try {
      const blockchains = await BlockchainModel.find({ chain: data.chain });
      const wallets = await WalletModel.find({ address: data.from });

      if (!wallets.length) {
        await TxOrphanedModel.create(data);
        throw new Error(
          `Wallet not found and txHash ${data.txHash} saved as orphaned!`
        );
      }

      await BalanceModel.findOneAndUpdate(
        {
          currency: data.currency,
          blockchain: blockchains[0]._id.toString(),
          wallet: wallets[0]._id.toString(),
        },
        { $inc: { amount: data.amount } },
        { upsert: true, session: session }
      );

      const balance = await BalanceModel.findOne(
        {
          blockchain: blockchains[0]._id,
          wallet: wallets[0]._id,
        },
        null,
        { session }
      ).populate({ path: 'wallet', select: 'user' });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const wallet = balance.wallet;

      return {
        currency: balance.currency.toString(),
        userId: wallet.user,
        amount: Number(balance.amount),
      };
    } catch (error) {
      handleError(error, 'Error updating balance inside');
    }
  }
}

module.exports = { BalanceService };
