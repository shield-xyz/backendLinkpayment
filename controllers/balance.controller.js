const Balance = require('../models/balance.model');
const AssetController = require('./assets.controller');

const BalanceController = {
  async createBalance(data) {
    const balance = new Balance(data);
    await balance.save();
    return balance;
  },

  async getBalances() {
    const balances = await Balance.find().populate("asset network");
    return balances.map(x => x.toObject());
  },

  async getBalanceById(id) {
    const balance = await Balance.findById(id).populate("asset network");
    return balance.toObject();
  },
  async findOne(filter) {
    const balance = await Balance.findOne(filter).populate("asset network");
    return balance.toObject();
  },
  async findMany(filter) {
    const balance = await Balance.find(filter).populate("asset network");
    return balance.map(x => x.toObject());
  },

  async updateBalance(id, data) {
    const balance = await Balance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return balance;
  },

  async deleteBalance(id) {
    const balance = await Balance.findByIdAndDelete(id);
    return balance;
  },
  async createBalancesPerUser(userId) {
    const assets = await AssetController.getAssets({ active: true });
    const balances = await this.findMany({ userId: userId });
    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      if (balances.find(x => x.assetId == asset.assetId) == undefined) {
        let b = await BalanceController.createBalance({
          amount: 0, networkId: asset.networkId, assetId: asset.assetId, userId: userId
        })
      }

    }
  }
};

module.exports = BalanceController;
