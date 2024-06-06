const Blockchain = require('../models/blockchain.model');
const { handleHttpError } = require('../utils');

const blockchainController = {
  async getAll(req, res) {
    try {
      const blockchains = await Blockchain.find();
      res.send({ blockchains });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

module.exports = blockchainController;
