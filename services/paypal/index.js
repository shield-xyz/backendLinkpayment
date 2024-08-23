const axios = require("axios");
const { randomUUID } = require("crypto");
const e = require("express");

const BASE_URLS = {
  development: "https://api-m.sandbox.paypal.com",
  production: "https://api-m.paypal.com",
};

class PayPal {
  clientId;
  clientSecret;
  instance;

  constructor(environment, clientId, clientSecret) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.instance = axios.create({
      baseURL: BASE_URLS[environment],
      timeout: 10000,
    });
  }

  async getAccessToken() {
    try {
      const { data } = await this.instance.post(
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

      return data.access_token;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createOrder(quote, asset, wallet) {
    try {
      const token = await this.getAccessToken();

      if (!token) {
        return null;
      }

      const { data } = await this.instance.post(
        "/v2/checkout/orders",
        {
          intent: "CAPTURE",
          application_context: {
            brand_name: "Shield Security Inc.",
            shipping_preference: "NO_SHIPPING",
          },
          purchase_units: [
            {
              description: `${
                quote.amountOut
              } ${quote.assetOut.toUpperCase()} ${asset.networkId} ${wallet}`,
              amount: {
                currency_code: quote.assetIn.toUpperCase(),
                value: quote.amountIn,
              },
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "PayPal-Request-Id": randomUUID(),
          },
        }
      );

      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

module.exports = PayPal;
