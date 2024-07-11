require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 1337
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_APIKEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon_amoy: {
      url: `https://polygon-amoy.infura.io/v3/${process.env.INFURA_APIKEY}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_APIKEY}`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
