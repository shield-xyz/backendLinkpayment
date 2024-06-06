const TxReceipt = require('../models/txReceipt.model');

async function validate(req, res, next) {
  try {
    let { txId, currency } = req.body;
    let receipt = await TxReceipt.findOne({ txHash: txId });

    if (currency === 'ETH') {
      req.body.counterAddress = req.body.counterAddress.toLowerCase();
    }

    if (receipt) {
      return res.status(500).json({ message: 'Duplicate transaction' });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
}

module.exports = validate;
