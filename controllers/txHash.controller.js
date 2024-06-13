const TxHash = require('../models/txHash.model');
const blockchainModel = require('../models/blockchain.model');
const { handleHttpError } = require('../utils/index.js');

const TxHashController = {
  async getAll(req, res) {
    try {
      const txHashes = await TxHash.find();
      res.send({ txHashes });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getByBlockchainInside(blockchainName) {
    try {
      let blockchain = await blockchainModel.findOne({
        name: blockchainName,
      });
      if (blockchain instanceof Error) {
        throw blockchain;
      }
      if (blockchain === null) {
        throw new Error('Blockchain not found');
      }

      const txHashes = await TxHash.find({ blockchain: blockchain.id });
      return txHashes;
    } catch (err) {
      return err;
    }
  },

  async deleteByBlockchainInside(blockchainName) {
    try {
      let blockchain = await blockchainModel.findOne({
        name: blockchainName,
      });
      if (blockchain instanceof Error) {
        throw blockchain;
      }
      if (blockchain === null) {
        throw new Error('Blockchain not found');
      }
      const txHashes = await TxHash.deleteMany({
        blockchain: blockchain.id,
      });
      return txHashes;
    } catch (err) {
      return err;
    }
  },

  async create(blockchainName, txHash) {
    try {
      let blockchain = await blockchainModel.findOne({
        name: blockchainName,
      });
      if (blockchain instanceof Error) {
        throw blockchain;
      }
      if (blockchain === null) {
        throw new Error('Blockchain not found');
      }

      const newHash = await TxHash.findOneAndUpdate(
        { txHash: txHash }, // filter
        {
          txHash: txHash,
          blockchain: blockchain.id,
          identificationDate: new Date(),
        }, // update
        { upsert: true } // create if not exists
      );

      return newHash;
    } catch (err) {
      return err;
    }
  },

  async getByBlockchain(req, res) {
    try {
      if (!req.body.blockchain) {
        throw new Error('Blockchain field is required');
      }

      let blockchain = await blockchainModel.findOne({
        name: req.body.blockchain,
      });
      if (blockchain instanceof Error) {
        throw blockchain;
      }

      if (blockchain === null) {
        throw new Error('Blockchain not found');
      }

      let response = await TxHashController.getByBlockchainInside(
        req.body.blockchain
      );
      res.send({ response });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async deleteByBlockchain(req, res) {
    try {
      if (!req.body.blockchain) {
        throw new Error('Blockchain field is required');
      }

      let blockchain = await blockchainModel.findOne({
        name: req.body.blockchain,
      });
      if (blockchain instanceof Error) {
        throw blockchain;
      }

      if (blockchain === null) {
        throw new Error('Blockchain not found');
      }

      let response = await TxHashController.deleteByBlockchainInside(
        req.body.blockchain
      );
      res.send({ response });
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

module.exports = TxHashController;
