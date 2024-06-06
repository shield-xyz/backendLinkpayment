const dotenv = require('dotenv');

dotenv.config();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || '';
const CRYPT_API_KEY = process.env.CRYPT_API_KEY || '';
const JWT_SECRET = process.env.JWT_SECRET || '';
const MONGOURI = process.env.MONGO_URL || 'mongodb://localhost:27017';
const PORT = process.env.PORT || 8080;
const RAMP_API_URL = process.env.RAMP_API_URL || '';
const RAMP_CLIENT_ID = process.env.RAMP_CLIENT_ID || '';
const RAMP_SECRET_ID = process.env.RAMP_SECRET_ID || '';
const SHIELD_USERID = process.env.SHIELD_USERID || '';
const TATUM_API_KEY = process.env.TATUM_API_KEY || '';
const TATUM_EXCHANGE_RATE_URL = process.env.TATUM_EXCHANGE_RATE_URL || '';
const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

const CHAIN_TYPE = {
  BTC: 'bitcoin',
  ETH: 'evm',
  TRON: 'tvm',
};

const CURRENCY = {
  USD: 'USD',
};

const TOKENS = ['BTC', 'ETH', 'TRX'];

const PLATFORM_ADDRESSES = {
  // Mainnet addresses
  'bitcoin-mainnet': '32KjG6o7TFcYyvHWADpg1m4JoXU4P5QN1L',
  'tron-mainnet': 'TWNxsGw1o4rnP4FExQSEXuYzLtXm3dMkRd',
  'ethereum-mainnet': '0x9e75e5185c7bd59f04147a28e3e663df674da2a0',

  // Testnet addresses
  'bitcoin-testnet': 'tb1qnz7l8tujzsty53pwvgsr2v4j3we2nlh0tp424d',
  'ethereum-sepolia': '0x939CaC66A13a8F777cc898B81c98eF50eC97796D',
  'tron-testnet': 'TG8G6qYAzCxSwR8Bzf2CJuBjU8qQ4MFxx2',
};

module.exports = {
  AIRTABLE_API_KEY,
  AIRTABLE_BASE_ID,
  AIRTABLE_TABLE_NAME,
  CRYPT_API_KEY,
  JWT_SECRET,
  MONGOURI,
  PORT,
  RAMP_API_URL,
  RAMP_CLIENT_ID,
  RAMP_SECRET_ID,
  SHIELD_USERID,
  TATUM_API_KEY,
  TATUM_EXCHANGE_RATE_URL,
  WEBHOOK_URL,
  CHAIN_TYPE,
  CURRENCY,
  TOKENS,
  PLATFORM_ADDRESSES,
};
