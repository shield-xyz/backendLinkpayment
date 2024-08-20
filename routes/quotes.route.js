const express = require("express");
const z = require("zod");
const { getRampQuote } = require("../controllers/quote.controller");

const router = express.Router();

const QuoteParamsSchema = z.object({
  type: z.enum(["onramp", "offramp"]),
});

const QuoteQuerySchema = z.object({
  assetIn: z.string(),
  assetOut: z.string(),
  amountIn: z.string(),
});

router.get("/:type", async function (req, res, next) {
  try {
    const { type } = QuoteParamsSchema.parse(req.params);
    const { assetIn, assetOut, amountIn } = QuoteQuerySchema.parse(req.query);

    const quote = await getRampQuote(
      type,
      assetIn.toUpperCase(),
      assetOut.toUpperCase(),
      amountIn,
      "0.01"
    );

    if (quote.error) {
      return res.status(400).send(quote);
    }

    return res.send(quote);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
