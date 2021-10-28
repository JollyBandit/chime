require('dotenv').config();
require("@nomiclabs/hardhat-waffle");

const INFURA_API_KEY = process.env.INFURA_API_KEY
const ROPSTEN_PRIVATE_KEY = process.env.ROPSTEN_PRIVATE_KEY

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: `${INFURA_API_KEY}`,
      accounts: [`0x${ROPSTEN_PRIVATE_KEY}`]
    }
  }
};
