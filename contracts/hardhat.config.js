require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId:710
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337
    },
    sepolia: {
      url: process.env.SEPOLIA_URL || "https://rpc.sepolia.dev",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== "YOUR_PRIVATE_KEY_HERE" 
        ? [process.env.PRIVATE_KEY] 
        : []
    },
    hedera: {
      url: process.env.HEDERA_URL || "https://testnet.hashio.io/api",
      accounts: process.env.PRIVATE_KEY && process.env.PRIVATE_KEY !== "YOUR_PRIVATE_KEY_HERE"
        ? [process.env.PRIVATE_KEY]
        : [],
      chainId: 296,
      gasPrice: 360000000000, // 360 gwei (minimum for Hedera)
      gas: 3000000
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "dummy-api-key"
  }
};
