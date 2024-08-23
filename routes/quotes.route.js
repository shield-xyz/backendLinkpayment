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

router.post("/onramp/paypal", auth, async function (req, res, next) {
  try {
    const { encoded, wallet } = req.body;
    const { id } = await createPayPalOrder(encoded, wallet);
    return res.send({ id });
  } catch (err) {
    return next(err);
  }
});

router.post("/onramp/paypal/webhook", async function (req, res, next) {
  try {
    const body = req.body;

    const email = body.resource.payment_source.paypal.email_address;

    const [cryptoAmount, cryptoSymbol, wallet] =
      body.resource.purchase_units[0].description.split(" ");

    const order = {
      name: body.resource.payment_source.paypal.name.given_name,
      surname: body.resource.payment_source.paypal.name.surname,
      amount: body.resource.purchase_units[0].amount.value,
      currency: body.resource.purchase_units[0].amount.currency_code,
      crypto_amount: cryptoAmount,
      crypto_symbol: cryptoSymbol,
      wallet,
      order_id: body.resource.id,
      order_date: body.resource.create_time,
    };

    const message = `
🚀 New Crypto Purchase Alert!

Amount: $${order.amount} ${order.currency}
Crypto Purchased: ${cryptoAmount} ${cryptoSymbol}

👤 Buyer Details:

- Name: ${order.name} ${order.surname}
- Email: ${email}
- Country: ${body.resource.payment_source.paypal.address.country_code}
- PayPal Account Status: ${body.resource.payment_source.paypal.account_status}
- Wallet Address: ${wallet}

Order ID: ${order.order_id}
Order Date: ${order.order_date}
Payment Source: PayPal

✅ Order Status: Approved`;

    console.log(order);

    await sendGroupMessage(message);
    await sendPayPalOrderApprovedEmail(email, order);

    return res.send("OK");
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
