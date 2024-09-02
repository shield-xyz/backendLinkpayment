const jwt = require("jsonwebtoken");
const Kraken = require("../services/kraken");
const PayPal = require("../services/paypal");
const { truncate } = require("../utils/math");
const PayPalOderModel = require("../models/PayPalOrder.model");
const AssetModel = require("../models/asset.model");
const NetworkModel = require("../models/networks.model");

const getRampQuote = async (type, assetIn, assetOut, amountIn, feeRate) => {
  const kraken = new Kraken();

  const { error, exchangeRate } =
    type === "onramp"
      ? await kraken.convert("1", assetOut, assetIn)
      : await kraken.convert(amountIn, assetIn, assetOut);

  if (error) return { error };

  const feeDeducted = Number(amountIn) * (1 - Number(feeRate)) - 0.5;
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

module.exports = { getRampQuote, createPayPalOrder };
