const config = require("../config");
const express = require("express");
const router = express.Router();
const {
  sendGroupMessage,
  response,
  validatePayment,
  getTransactionOnly,
} = require("../utils");
const logger = require("node-color-log");
const TransactionBuySellModel = require("../models/TransactionBuySell.model");
const auth = require("../middleware/auth");
const AssetController = require("../controllers/assets.controller");
const NetworkController = require("../controllers/network.controller");
const WalletNetworkUser = require("../models/walletNetworkUser.model");
const TycMiddleware = require("../middleware/TycMiddleware.js");

const {
  sendRampConfirmationEmail,
} = require("../controllers/email.controller");

const formatOnRampMessage = (transaction, user) => {
  return `*New On-Ramp Request Received*

*Client/Company Name:* ${user.user_name}

*Transaction Details:*

- *Amount Transferred:* ${transaction.transactionDetails.amountTransferred}
- *Cryptocurrency to Purchase:* ${transaction.transactionDetails.assetId}
- *Network:* ${transaction.transactionDetails.networkId}
- *Recipient Wallet Address:* ${transaction.transactionDetails.walletAddress}

*Action Required:* Please proceed with the crypto transfer.`;
};

const formatOffRampMessage = (transaction, user) => {
  return `*New Off-Ramp Request Received*

*Client/Company Name:* ${user.user_name}

*Bank Transfer Details:*
- *Bank Name:* ${transaction.bankDetails.bankName}
- *Account Number:* ${transaction.bankDetails.accountNumber}
- *Routing Number:* ${transaction.bankDetails.routingNumber}
- *Beneficiary Name:* ${transaction.bankDetails.beneficiaryName}
- *Country:* ${transaction.bankDetails.country}
- *State:* ${transaction.bankDetails.state}
- *City:* ${transaction.bankDetails.city}
- *Street Address:* ${transaction.bankDetails.streetAddress}
- *Zip Code:* ${transaction.bankDetails.zipCode}

*Transaction Details:*
- *Amount to Transfer:* ${transaction.transactionDetails.amountToTransfer}
- *Transaction Hash:* ${transaction.transactionDetails.transactionHash}
- *Network:* ${transaction.transactionDetails.networkId}
- *Token Sold:* ${transaction.transactionDetails.assetId}

*Action Required:* Please proceed with the bank transfer.`;
};

router.post("/sell", auth, TycMiddleware, async (req, res) => {
  try {
    const { bankDetails, transactionDetails } = req.body;
    const transaction = new TransactionBuySellModel({
      type: "sell",
      userId: req.user._id,
      bankDetails,
      transactionDetails,
    });
    const message = formatOffRampMessage(transaction, req.user);
    await sendGroupMessage(message);
    await sendRampConfirmationEmail(req.user.email, transaction);
    // validar tx .
    let asset = await AssetController.findOne({
      assetId: transactionDetails.assetId,
    });
    let network = await NetworkController.findOne({
      networkId: transactionDetails.networkId,
    });
    let resp = await validatePayment(
      transactionDetails.transactionHash,
      transactionDetails.amountToTransfer,
      network,
      asset,
      req.user._id,
      null,
      null
    );
    console.log(resp);
    if (resp.status == "success") {
      const message = formatOnRampMessage(transaction, req.user);
      await sendGroupMessage(message);
      await sendRampConfirmationEmail(req.user.email, transaction);
      transaction.status = "notified";
      await transaction.save();
      return res.status(200).json(response("transaction created successfully"));
    } else {
      return res
        .status(200)
        .json(response("transaction failed, " + resp.response));
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json(response(error.message, "error"));
  }
});
router.post("/buy", auth, TycMiddleware, async (req, res) => {
  try {
    const { bankDetails, transactionDetails } = req.body;
    const transaction = new TransactionBuySellModel({
      type: "buy",
      userId: req.user._id,
      bankDetails,
      transactionDetails,
    });
    const message = formatOnRampMessage(transaction, req.user);
    await sendGroupMessage(message);
    await sendRampConfirmationEmail(req.user.email, transaction);
    transaction.status = "notified";
    await transaction.save();
    return res.status(200).json(response("transaction created successfully"));
  } catch (error) {
    console.log(error);
    return res.status(200).json(response(error.message, "error"));
  }
});

router.get("/", auth, async (req, res) => {
  try {
    let data = await TransactionBuySellModel.find({ userId: req.user._id });
    return res.status(200).json(response(data));
  } catch (error) {
    logger.error(error);
    return res.status(200).json(response([], "error"));
  }
});

module.exports = router;
