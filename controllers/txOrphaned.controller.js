const { handleHttpError } = require('../utils');
const { TxOrphanedService } = require('../services/txOrphaned.service');

const TxOrphanedController = {
  async getTxOrphaned(req, res) {
    try {
      const txOrphaned = await TxOrphanedService.getTxOrphaned();
      res.status(200).json(txOrphaned);
    } catch (error) {
      handleHttpError(error, res);
    }
  },

  async reassignTx(req, res) {
    try {
      const { txHash, fromAddress } = req.body;

      if (!txHash || !fromAddress) {
        throw new Error('txHash and fromAddress are required!');
      }

      await TxOrphanedService.reassignTx(txHash, fromAddress);
      res.status(200).json({
        message: `Tx ${txHash} reassigned to ${fromAddress} successfully!`,
      });
    } catch (error) {
      handleHttpError(error, res);
    }
  },
};

module.exports = TxOrphanedController;
