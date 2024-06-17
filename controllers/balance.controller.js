const Balance = require('../models/balance.model');

const BalanceController = {
  async createBalance(data) {
    const balance = new Balance(data);
    await balance.save();
    return balance;
  },

  async getBalances() {
    const balances = await Balance.find();
    return balances;
  },

  async getBalanceById(id) {
    const balance = await Balance.findById(id);
    return balance;
  },
  async findOne(filter){
    const balance = await Balance.find(filter);
    return balance;
  },
  async findMany(filter){
    const balance = await Balance.find(filter);
    return balance;
  },

  async updateBalance(id, data) {
    const balance = await Balance.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return balance;
  },

  async deleteBalance(id) {
    const balance = await Balance.findByIdAndDelete(id);
    return balance;
  }
};

module.exports = BalanceController;
