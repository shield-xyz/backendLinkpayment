const jwt = require("jsonwebtoken");
const Kraken = require("../services/kraken");
const PayPal = require("../services/paypal");
const { truncate } = require("../utils/math");

const getRampQuote = async (type, assetIn, assetOut, amountIn, feeRate) => {
  const kraken = new Kraken();

  const { error, exchangeRate } =
    type === "onramp"
      ? await kraken.convert("1", assetOut, assetIn)
      : await kraken.convert(amountIn, assetIn, assetOut);

  if (error) return { error };

  const feeDeducted = Number(amountIn) * (1 - Number(feeRate));
  const amountOut =
    type === "onramp"
      ? truncate(feeDeducted / Number(exchangeRate), 6)
      : truncate(feeDeducted * Number(exchangeRate), 2);

  if (
    // USD amount should be more than $50
    (type === "onramp" && Number(amountIn) < 50) ||
    (type === "offramp" && Number(amountOut) < 50)
  ) {
    return { error: ["Amount in USD should be more than $50"] };
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

const createPayPalOrder = async (encoded) => {
  const quote = verifyRampQuote(encoded);
  const paypal = new PayPal(
    process.env.NODE_ENV,
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  );
  return await paypal.createOrder(quote);
};

module.exports = { getRampQuote, createPayPalOrder };
