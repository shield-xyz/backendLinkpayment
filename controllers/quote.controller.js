const jwt = require("jsonwebtoken");
const Kraken = require("../services/kraken");
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

module.exports = { getRampQuote };
