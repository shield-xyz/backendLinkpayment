const logger = require('node-color-log');
const { ClientSession } = require('mongoose');

const { handleError } = require('../utils/index.js');
const TxReceiptModel = require('../models/txReceipt.model');

class TxReceiptService {
  static async create(data, session) {
    try {
      const txReceipt = await TxReceiptModel.findOne({ txHash: data.txHash });

      if (txReceipt) {
        logger.warn(`TxHash ${data.txHash} already exists as orphaned!`);
        return;
      }

      await TxReceiptModel.create([data], { session });

      logger.info(`TxHash ${data.txHash} saved as orphaned!`);
    } catch (error) {
      handleError(
        error,
        `An error occurred while saving txHash ${data.txHash} as orphaned`
      );
    }
  }
}

module.exports = { TxReceiptService };
