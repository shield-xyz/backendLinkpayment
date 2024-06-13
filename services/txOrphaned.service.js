const logger = require('node-color-log');
const { ethers } = require('ethers');
const mongoose = require('mongoose');

const TxOrphanedModel = require('../models/txOrphaned.model');
const { getExchangeRate, getRampUserId, handleError } = require('../utils/index.js');
const txReceiptModel = require('../models/txReceipt.model');
const { LimitsService } = require('./limits.service');
const { BalanceService } = require('./balance.service');

class TxOrphanedService {
  static async create(data) {
    try {
      const txOrphaned = await TxOrphanedModel.findOne({ txHash: data.txHash });

      if (txOrphaned) {
        logger.warn(`TxHash ${data.txHash} already exists as orphaned!`);
        return;
      }

      await TxOrphanedModel.create(data);

      logger.info(`TxHash ${data.txHash} saved as orphaned!`);
    } catch (error) {
      handleError(
        error,
        `An error occurred while saving txHash ${data.txHash} as orphaned`
      );
    }
  }

  static async getTxOrphaned() {
    try {
      return await TxOrphanedModel.find();
    } catch (error) {
      handleError(error, 'An error occurred while fetching txOrphaned');
    }
  }

  static async reassignTx(txHash, fromAddress) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const txOrphaned = await TxOrphanedModel.findOne({ txHash });

      if (!txOrphaned) {
        throw new Error(`TxOrphaned ${txHash} not found`);
      }

      await txReceiptModel.updateOne(
        { txHash },
        { $set: { from: fromAddress } },
        { session }
      );

      await TxOrphanedModel.deleteOne({ txHash }, { session });

      const txReceipt = await txReceiptModel
        .findOne({ txHash })
        .populate('blockchain');

      if (!txReceipt) {
        throw new Error(`TxReceipt ${txHash} not found`);
      }

      const blockchain = txReceipt.blockchain;

      const balanceData = {
        chain: blockchain.chain,
        amount: ethers.formatEther(ethers.parseEther(txReceipt.amount)),
        from: fromAddress,
        to: txReceipt.to,
        blockNumber: txReceipt.blockNumber,
        txHash: txReceipt.txHash,
        currency: blockchain.nativeSymbol,
      };

      const result = await BalanceService.updateInside(balanceData, session);
      const userId = result.userId;

      const rampUserId = await getRampUserId(userId);

      const totalUserUSDBalance = await BalanceService.getTotalUSDUserBalance(
        userId,
        session
      );

      await LimitsService.updateUserSpendLimits(
        rampUserId,
        totalUserUSDBalance
      );

      await session.commitTransaction();

      logger.info(`Tx ${txHash} reassigned successfully to ${fromAddress}!`);
    } catch (error) {
      await session.abortTransaction();
      handleError(
        error,
        `An error occurred while updating from address for txHash ${txHash}`
      );
    } finally {
      session.endSession();
    }
  }
}

module.exports = { TxOrphanedService };

