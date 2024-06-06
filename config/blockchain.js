const { Network } = require('@tatumio/tatum');

const SUPPORTED_TESTNET_NETWORKS = [
  Network.BITCOIN_TESTNET,
  Network.ETHEREUM_SEPOLIA,
  Network.TRON_SHASTA,
];

const SUPPORTED_MAINNET_NETWORKS = [
  Network.BITCOIN,
  Network.ETHEREUM,
  Network.TRON,
];

const SUPPORTED_CHAINS = ['Ethereum', 'Bitcoin', 'Tron'];

// https://apidoc.tatum.io/tag/Exchange-rate#operation/getExchangeRate
const BTC_CURRENCY = 'BTC';
const ETH_CURRENCY = 'ETH';
const TRON_CURRENCY = 'TRON';
const USD_BASE_PAIR = 'USD';

module.exports = {
  SUPPORTED_TESTNET_NETWORKS,
  SUPPORTED_MAINNET_NETWORKS,
  SUPPORTED_CHAINS,
  BTC_CURRENCY,
  ETH_CURRENCY,
  TRON_CURRENCY,
  USD_BASE_PAIR,
};
