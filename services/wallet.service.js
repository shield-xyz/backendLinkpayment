const { getAllExchangeRates, handleError } = require('../utils/index.js');
const Wallet = require('../models/wallet.model');

class WalletService {
  static async getPrices() {
    try {
      const priceArr = await getAllExchangeRates();
      return priceArr;
    } catch (error) {
      handleError(error, `Failed to get prices`);
    }
  }

  static async getUserWallets(userId) {
    try {
      const wallets = await Wallet.find({ user: userId }).populate(
        'blockchains'
      );

      if (!wallets) {
        throw new Error(`No wallets found for user ${userId}`);
      }

      return wallets;
    } catch (error) {
      handleError(error, `Failed to get user wallets`);
    }
  }
}

module.exports = { WalletService };
