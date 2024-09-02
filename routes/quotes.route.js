const express = require("express");
const z = require("zod");
const {
  getRampQuote,
  createPayPalOrder,
} = require("../controllers/quote.controller");
const auth = require("../middleware/auth");
const { sendGroupMessage } = require("../utils");
const {
  sendPayPalOrderApprovedEmail,
} = require("../controllers/email.controller");
const { log } = require("handlebars/runtime");
const TycMiddleware = require("../middleware/TycMiddleware");
const PayPalOrderModel = require("../models/PayPalOrder.model");
const PayPal = require("../services/paypal");

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
      "0.0449"
    );

    if (quote.error) {
      return res.status(400).send(quote);
    }

    return res.send(quote);
  } catch (err) {
    return next(err);
  }
});

router.post(
  "/onramp/paypal",
  auth,
  TycMiddleware,
  async function (req, res, next) {
    try {
      const { encoded, network, wallet } = req.body;
      console.log("/onramp/paypal", req.body);
      const { id } = await createPayPalOrder(
        req.user._id,
        encoded,
        network,
        wallet
      );
      return res.send({ id });
    } catch (err) {
      return next(err);
    }
  }
);

router.post("/onramp/paypal/webhook", async function (req, res, next) {
  try {
    const { event_type, resource } = req.body;

    console.log(`Received PayPal Webhook: ${event_type}`);

    const order = await PayPalOrderModel.findOne({ order_id: resource.id })
      .populate(["user", "asset", "network"])
      .orFail();

    const paypal = new PayPal(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );

    const capture = await paypal.captureOrder(resource.id);

    console.log(JSON.stringify(capture, null, 2));

    await order.updateOne({ status: capture.status });

    if (capture.status !== "COMPLETED") {
      return res.send("OK");
    }

    const email = order.user.email;

    const payload = {
      name: resource.payment_source.paypal.name.given_name,
      surname: resource.payment_source.paypal.name.surname,
      amount: resource.purchase_units[0].amount.value,
      currency: resource.purchase_units[0].amount.currency_code,
      crypto_amount: order.amount,
      crypto_symbol: order.asset.symbol,
      network: order.network.name,
      wallet: order.wallet,
      order_id: resource.id,
      order_date: resource.create_time,
    };

    const message = `
    🚀 New Crypto Purchase Alert!

    Amount: $${payload.amount} ${payload.currency}
    Crypto Purchased: ${payload.crypto_amount} ${payload.crypto_symbol}
    Network: ${payload.network}

    👤 Buyer Details:

    - Name: ${payload.name} ${payload.surname}
    - Email: ${email}
    - Country: ${resource.payment_source.paypal.address.country_code}
    - PayPal Account Status: ${resource.payment_source.paypal.account_status}
    - Wallet Address: ${payload.wallet}

    Order ID: ${payload.order_id}
    Order Date: ${payload.order_date}
    Payment Source: PayPal

    ✅ Order Status: Approved`;

    console.log(payload);

    await sendGroupMessage(message);
    await sendPayPalOrderApprovedEmail(email, payload);

    return res.send("OK");
  } catch (err) {
    return next(err);
  }
});

router.post("/onramp/payoneer", async function (req, res, next) {
  try {
    const { encoded, asset, wallet } = req.body;
    // const { id } = await createPayoneerOrder(encoded, asset, wallet);
    // return res.send({ id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
