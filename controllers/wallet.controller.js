const mongoose = require('mongoose');
const Wallet = require('../models/wallet.model');
const Blockchain = require('../models/blockchain.model');
const User = require('../models/user.model');
const { SHIELD_USERID, TOKENS } = require('../config');
const {
  getAllExchangeRates,
  getHistoricPrice,
  handleError,
  handleHttpError,
  validateWalletAddress,
} = require('../utils/index.js');
const { WalletService } = require('../services');

const WalletController = {
  async shield(req, res) {
    const userId = SHIELD_USERID;
    if (userId === undefined) {
      handleHttpError(new Error('User not set!'), res, 400);
      return;
    }

    try {
      const wallets = await WalletService.getUserWallets(userId);
      res.send({ wallets });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getAll(req, res) {
    try {
      const wallet = await Wallet.find()
        .populate('user')
        .populate('blockchains');
      res.send({ wallet });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getWalletByAddressInside(address) {
    if (!address) {
      throw new Error('Wallet address is empty!');
    }

    try {
      const wallet = await Wallet.findOne({ address })
        .populate({
          path: 'blockchains',
          select: 'name', // Only populate the 'name' field of the 'blockchain' document
        })
        .populate({
          path: 'user',
          select: 'email', // Only populate the 'email' field of the 'user' document
        });
      return wallet;
    } catch (err) {
      handleError(err, `Failed to get wallet by address ${address}!`);
    }
  },

  async getWalletByAddress(req, res) {
    if (req.params.address === undefined) {
      handleHttpError(new Error('Wallet address is empty!'), res, 400);
      return;
    }

    try {
      const wallet = await WalletController.getWalletByAddressInside(req.params.address);
      res.send({ wallet });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getWalletByBlockchain(req, res) {
    if (req.params.blockchain === undefined) {
      handleHttpError(new Error('Blockchain is empty!'), res, 400);
      return;
    }

    try {
      const blockchain = await Blockchain.findOne({ name: req.params.blockchain }).populate('wallets');
      if (blockchain === null) {
        handleHttpError(new Error('Blockchain not found!'), res, 404);
        return;
      }

      res.send({ wallets: blockchain.wallets });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getWalletByUser(req, res) {
    const { userId } = req.params;

    if (userId === undefined) {
      handleHttpError(new Error('User is empty!'), res, 400);
      return;
    }

    try {
      const wallets = await WalletService.getUserWallets(userId);
      res.send({ wallets });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getWalletByCurrentUser(req, res) {
    const userId = req.body.user.id;

    if (req.body.user === undefined) {
      handleHttpError(new Error('User is empty!'), res, 400);
      return;
    }

    try {
      const wallets = await WalletService.getUserWallets(userId);
      res.send({ wallets });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async updateWallet(req, res) {
    try {
      if (req.body.blockchain === undefined) {
        handleHttpError(new Error('Blockchain can not be empty!'), res, 400);
        return;
      }

      if (req.body.oldAddress === undefined || req.body.newAddress === undefined) {
        handleHttpError(
          new Error('Old Address and New Address can not be empty!'),
          res,
          400
        );
        return;
      }

      if (req.body.user === undefined) {
        handleHttpError(new Error('User can not be empty!'), res, 400);
        return;
      }

      // get blockchain Id
      const blockchain = await Blockchain.findOne({ name: req.body.blockchain });
      if (blockchain === null) {
        handleHttpError(new Error('Blockchain not found!'), res, 404);
        return;
      }

      let result = await Wallet.findOneAndUpdate(
        { user: req.body.user.id, address: req.body.oldAddress },
        { $set: { address: req.body.newAddress } }
      );

      if (result) {
        res.send({ wallet: result });
      } else {
        handleHttpError(new Error('Wallet not found!'), res, 404);
      }
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async create(req, res) {
    if (
      req.body.address === undefined ||
      req.body.user === undefined ||
      req.body.blockchains === undefined ||
      req.body.blockchains.length === 0
    ) {
      handleHttpError(
        new Error('Wallet address, user or blockchains can not be empty!'),
        res,
        400
      );
      return;
    }

    // Start a session for the transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    let address = req.body?.address;

    if (address.startsWith('0x')) {
      req.body.address = address.toLowerCase();
    }

    try {
      // get blockchain ids
      let blockchainIds = [];
      let chainType = '';
      for (let blockchainName of req.body.blockchains) {
        const blockchain = await Blockchain.findOne({ chain: blockchainName }).exec();

        if (blockchain) {
          if (chainType && chainType !== blockchain.chainType) {
            res.status(400).send({
              message: 'Wallet can not be created with multiple blockchain types!',
            });
            return;
          }
          chainType = blockchain.chainType;
          blockchainIds.push(blockchain._id);
        }
      }

      // validate wallet address
      const isValid = await validateWalletAddress(address, chainType);
      if (isValid !== true) {
        handleHttpError(
          new Error(`Address ${address} considered not valid for blockchain type ${chainType}`),
          res,
          400
        );
        return;
      }

      // Create the new Wallet
      const wallet = new Wallet(req.body);
      wallet.blockchains = blockchainIds;

      // if not passed a specific user id it will create for the logged user
      wallet.user = req.body.userId || req.body.user.id;
      wallet.date = new Date();
      await wallet.save({ session });

      // Add the new wallet to each associated blockchain
      await Blockchain.updateMany(
        { _id: { $in: blockchainIds } },
        { $push: { wallets: wallet._id } },
        { session }
      );

      // Add the new wallet to the user
      await User.updateMany(
        { _id: { $in: wallet.user } },
        { $push: { wallets: wallet._id } },
        { session }
      );

      // Commit the transaction
      await session.commitTransaction();

      // End the session
      session.endSession();

      // Find the new wallet
      const result = await Wallet.findOne({ address: address });
      res.send({ wallet: result });
    } catch (error) {
      // If an error occurred, abort the transaction
      await session.abortTransaction();
      handleHttpError(error, res);
    }
  },

  async updateBalanceByAddress(req, res) {
    if (req.params.address === undefined || req.body === undefined || !req.body.balance) {
      handleHttpError(new Error('Wallet address or balance can not be empty!'), res, 400);
      return;
    }

    try {
      const wallet = await Wallet.findOneAndUpdate(
        { address: req.params.address },
        { balance: req.body.balance }
      );

      if (wallet) {
        const result = await Wallet.findOne({ address: wallet.address });
        res.send({ wallet: result });
      } else {
        handleHttpError(new Error('Wallet not found!'), res, 404);
      }
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getTokenPrice(req, res) {
    try {
      const priceArr = await getAllExchangeRates();
      res.send({ data: priceArr });
    } catch (err) {
      handleHttpError(err, res);
    }
  },

  async getHistoricalPrice(req, res) {
    const { ticker, date } = req.body;

    if (!ticker || !date) {
      handleHttpError(new Error('Ticker and date are required fields!'), res, 400);
      return;
    }

    if (TOKENS.indexOf(ticker) === -1) {
      handleHttpError(
        new Error(
          `Invalid ticker! The ticker must be one of the following: ${TOKENS.join(', ')}`
        ),
        res,
        400
      );
      return;
    }

    try {
      const price = await getHistoricPrice(ticker, date);

      const result = {
        ticker,
        date,
        price,
      };

      res.send(result);
    } catch (err) {
      handleHttpError(err, res);
    }
  },
};

module.exports = WalletController;
