var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "skin moment dizzy boost bitter network chaos pink horror credit that polar";

module.exports = {
    networks: {
      development: {
        host: 'localhost',
        port: 8545,
        network_id: '*' // Match any network id
      },
      rinkeby: {
        provider: function () {
          return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/79738d10e34046b9abe619d5fdb53a3c");
            },
            network_id: 1
        }
      }
    }