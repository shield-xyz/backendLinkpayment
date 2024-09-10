const jwt = require("jsonwebtoken");
const Kraken = require("../services/kraken");
const PayPal = require("../services/paypal");
const { truncate } = require("../utils/math");
const UserModel = require("../models/user.model");
const OffRampOrderModel = require("../models/OffRampOrder.model");
const PayPalOderModel = require("../models/PayPalOrder.model");
const WireOrderModel = require("../models/WireOrder.model");
const AssetModel = require("../models/asset.model");
const NetworkModel = require("../models/networks.model");
const { footPrintGetBankData, sendGroupMessage } = require("../utils");
const {
  sendOffRampOrderApprovedEmail,
} = require("../controllers/email.controller");

const getRampQuote = async (
  type,
  assetIn,
  assetOut,
  amountIn,
  feeRate,
  fixedFee
) => {
  const kraken = new Kraken();

  const { error, exchangeRate } =
    type === "onramp"
      ? await kraken.convert("1", assetOut, assetIn)
      : await kraken.convert(amountIn, assetIn, assetOut);

  if (error) return { error };

  const feeDeducted =
    Number(amountIn) * (1 - (Number(feeRate) + 0.01)) - Number(fixedFee);

  const amountOut =
    type === "onramp"
      ? truncate(feeDeducted / Number(exchangeRate), 6)
      : truncate(feeDeducted * Number(exchangeRate), 2);

  if (
    // USD amount should be more than $10
    (type === "onramp" && Number(amountIn) < 10) ||
    (type === "offramp" && Number(amountOut) < 10)
  ) {
    return { error: ["Amount in USD should be more than $10"] };
  }

  const payload = {
    amountIn,
    assetIn,
    amountOut,
    assetOut,
    exchangeRate,
    feeRate,
  };
  const encoded = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "30s",
  });

  return { ...payload, encoded };
};

const verifyRampQuote = (encoded) => {
  try {
    return jwt.verify(encoded, process.env.JWT_SECRET);
  } catch (err) {
    return { error: ["Invalid or expired quote"] };
  }
};

const createOffRampOrder = async (user, encoded, networkId) => {
  const quote = verifyRampQuote(encoded);

  const asset = await AssetModel.findOne({ symbol: quote.assetIn }).orFail();
  const network = await NetworkModel.findOne({ networkId }).orFail();

  const order = await OffRampOrderModel.create({
    user,
    amountIn: quote.amountIn,
    assetIn: asset._id,
    amountOut: quote.amountOut,
    assetOut: quote.assetOut,
    network: network._id,
  });

  return { id: order._id };
};

const verifyOffRampOrder = async (id, hash) => {
  const order = await OffRampOrderModel.findById(id)
    .populate(["user", "assetIn", "network"])
    .orFail();

  const bankDetails = await footPrintGetBankData(order.user.footId);

  await order.updateOne({ status: "PENDING", hash });

  const email = order.user.email;

  const payload = {
    name: order.user.user_name,
    crypto_amount: order.amountIn,
    crypto_symbol: order.assetIn.symbol,
    amount: order.amountOut,
    currency: order.assetOut,
    order_date: order.createdAt.toISOString().split("T")[0],
  };

  const message = `
    🚀 New Crypto Sale Alert!

    Amount: $${payload.amount} ${payload.currency}
    Crypto Sold: ${payload.crypto_amount} ${payload.crypto_symbol}
    Network: ${order.network.name}

    👤 Seller Details:

    - Name: ${payload.name}
    - Email: ${email}
    - Bank Name: ${bankDetails["custom.bank_name"]}
    - Account Number: ${bankDetails["custom.account_number"]}
    - Routing Number: ${bankDetails["custom.routing_number"]}
    - Beneficiary Name: ${bankDetails["custom.beneficiary_name"]}
    - Country: ${bankDetails["custom.country"]}
    - State: ${bankDetails["custom.state"]}
    - City: ${bankDetails["custom.city"]}
    - Street Address: ${bankDetails["custom.street_address"]}
    - Zip Code: ${bankDetails["custom.zip_code"]}
    
    Order Date: ${payload.order_date}
    Transaction Hash: ${hash}
    Payment Source: Crypto Transfer

    ✅ Order Status: Approved`;

  await sendGroupMessage(message);
  await sendOffRampOrderApprovedEmail(email, payload);

  return true;
};

const createPayPalOrder = async (user, encoded, networkId, wallet) => {
  const quote = verifyRampQuote(encoded);

  const paypal = new PayPal(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );

  const order = await paypal.createOrder(quote.assetIn, quote.amountIn);

  const asset = await AssetModel.findOne({ symbol: quote.assetOut }).orFail();
  const network = await NetworkModel.findOne({ networkId }).orFail();

  await PayPalOderModel.create({
    order_id: order.id,
    user,
    amount: quote.amountOut,
    asset: asset._id,
    network: network._id,
    wallet,
  });

  return order;
};

const createWireOrder = async (user, encoded, networkId, wallet) => {
  const quote = verifyRampQuote(encoded);

  const asset = await AssetModel.findOne({ symbol: quote.assetOut }).orFail();
  const network = await NetworkModel.findOne({ networkId }).orFail();

  const order = await WireOrderModel.create({
    user,
    amountIn: quote.amountIn,
    assetIn: quote.assetIn,
    amountOut: quote.amountOut,
    assetOut: asset._id,
    network: network._id,
    wallet,
  });

  return { status: "success", order };
};

module.exports = {
  getRampQuote,
  createOffRampOrder,
  verifyOffRampOrder,
  createPayPalOrder,
  createWireOrder,
};
