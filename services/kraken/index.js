const { TickerResponseSchema } = require("./schemas");
const { truncate } = require("../../utils/math");
const axios = require("axios");

class Kraken {
  instance;

  constructor(baseURL = "https://api.kraken.com/0/public") {
    this.instance = axios.create({ baseURL, timeout: 10000 });
  }

  async request(endpoint, config = {}) {
    try {
      const { data } = await this.instance.get(endpoint, config);
      return data;
    } catch (error) {
      throw new Error(`Request failed: ${error}`);
    }
  }

  async getTicker(pair) {
    const data = await this.request(`/Ticker?pair=${pair}`);
    const { error, result } = TickerResponseSchema.parse(data);

    if (error.length) return { error };

    if (!result) return { error: ["No data returned"] };

    const key = Object.keys(result)[0];
    return { pair, result: result[key] };
  }

  async getPrice(pair) {
    const { error, result } = await this.getTicker(pair);

    if (error) return { error };

    const exchangeRate = truncate(result.c[0], 2);
    return { pair, exchangeRate };
  }

  async convert(amountIn, baseAsset, quoteAsset) {
    const { error, exchangeRate } = await this.getPrice(
      `${baseAsset}${quoteAsset}`
    );

    if (error) return { error };

    const amountOut = Number(amountIn) * Number(exchangeRate);
    return { amountIn, baseAsset, quoteAsset, exchangeRate, amountOut };
  }
}

module.exports = Kraken;
