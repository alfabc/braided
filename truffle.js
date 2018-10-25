const HDWalletProvider = require('truffle-hdwallet-provider')
require('dotenv').config()

module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    // for ganache-gui
    ganache: {
      host: 'localhost',
      port: 7545,
      network_id: '5777',
      gas: 2000000
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_MAINNET_OWNER, 'http://127.0.0.1:8545'),
      network_id: '1',
      gasPrice: 10000000000,
      gas: 4612388
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_ROPSTEN_OWNER, 'http://127.0.0.1:3373'),
      network_id: '3',
      gasPrice: 10000000000,
      gas: 4700000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_RINKEBY_OWNER, 'http://127.0.0.1:3374'),
      network_id: '4',
      gas: 6700000
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_KOVAN_OWNER, 'http://127.0.0.1:3412'),
      network_id: '42',
      gas: 4700000
    }
  }
}
