const LinkPayment = require("../models/LinkPayment");
const balanceModel = require("../models/balance.model");
const Payment = require("../models/payment.model");

const PaymentController = {
  async createPayment(data) {
    const payment = new Payment(data);
    await payment.save();

    // Logger for create payment link

    // logger.info(`Payment link generated: linkId=${payment._id}, createdAt=${new Date(payment.created_on)}`);

    return payment;
  },

  async getPayments(filter = {}) {
    const payments = await Payment.find(filter).populate("asset");
    return payments;
  },
  async getOne(filter) {
    const payments = await Payment.findOne(filter);
    return payments;
  },
  async findId(id) {
    const payment = await Payment.findById(id).populate({
      path: "user",
      // populate: {
      //     path: 'configurations',
      //     model: 'ConfigurationUser'
      // }
    });
    return payment;
  },

  async updatePayment(filter, data) {
    const payment = await Payment.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    return payment;
  },

  async deletePayment(id) {
    const payment = await Payment.findByIdAndDelete(id);
    return payment;
  },
  async loadBalanceImported(idPayment) {
    let payment = await Payment.findById(idPayment).populate("asset");
    // console.log(payment.asset, "payment");
    if (payment.balanceImported == false) {
      let balance = await balanceModel.findOne({
        userId: payment.userId,
        assetId: payment.assetId,
      });
      if (!balance) {
        balance = new balanceModel({
          amount: 0,
          networkId: payment.asset.networkId,
          assetId: payment.assetId,
          userId: payment.userId,
        });
      }
      balance.amount += payment.quote_amount;
      balance.save();
      payment.balanceImported = true;
      payment.save();
    }
  },
  async loadBalanceImportedLinkPayment(payment) {
    // let payment = await LinkPayment.findOne({ id: idLink }).populate("asset");
    // console.log(payment.asset, "payment");
    if (payment.balanceImported == false) {
      let balance = await balanceModel.findOne({
        userId: payment.merchantId,
        assetId: payment.assetId,
      });
      if (!balance) {
        balance = new balanceModel({
          amount: 0,
          networkId: payment.asset.networkId,
          assetId: payment.assetId,
          userId: payment.merchantId,
        });
      }
      balance.amount += payment.amount;
      await balance.save();
      payment.balanceImported = true;
      await payment.save();
    }
  },

  // Logger for getting Usage patterns (time of day, frequency of use).

  // async getUsagePatterns(req, res) {
  //     try {
  //       const links = await Payment.find();

  //       const usagePatterns = links.reduce((acc, link) => {
  //         link.usedAt.forEach((date) => {
  //           const hour = date.getHours();
  //           acc[hour] = (acc[hour] || 0) + 1;
  //         });
  //         return acc;
  //       }, {});

  //       res.status(200).json({ usagePatterns });
  //     } catch (error) {
  //       logger.error(`Get usage patterns error: ${error.message}`);
  //       res.status(500).json({ error: 'Failed to get usage patterns' });
  //     }
  //   }
};

module.exports = PaymentController;
