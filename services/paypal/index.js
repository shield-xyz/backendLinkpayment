const axios = require("axios");
const { randomUUID } = require("crypto");

class PayPal {
  instance;
  clientId;
  clientSecret;

  constructor(clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.instance = axios.create({
      baseURL: process.env.PAYPAL_API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async auth() {
    const res = await this.instance.post(
      "/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          username: this.clientId,
          password: this.clientSecret,
        },
      }
    );

    return res.data;
  }

  async request(config) {
    const { access_token } = await this.auth();

    return await this.instance.request({
      ...config,
      headers: { Authorization: `Bearer ${access_token}`, ...config.headers },
    });
  }

  async createOrder(symbol, amount) {
    const data = {
      purchase_units: [
        {
          amount: {
            currency_code: symbol,
            value: amount,
          },
        },
      ],
      intent: "CAPTURE",
      payment_source: {
        paypal: {
          experience_context: {
            payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
            brand_name: "Shield Security Inc.",
            locale: "en-US",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: `${process.env.URL_FRONT}/buy-sell`,
            cancel_url: `${process.env.URL_FRONT}/buy-sell`,
          },
        },
      },
    };

    const headers = { "PayPal-Request-Id": randomUUID() };

    const res = await this.request({
      url: "/v2/checkout/orders",
      method: "POST",
      data,
      headers,
    });

    return res.data;
  }

  async captureOrder(id) {
    const res = await this.request({
      url: `/v2/checkout/orders/${id}/capture`,
      method: "POST",
    });
    return res.data;
  }
}

module.exports = PayPal;
