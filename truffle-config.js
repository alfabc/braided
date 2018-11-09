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
      gasPrice: 20000000000,
      gas: 6721975
    },
    mainnet: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_MAINNET_OWNER, process.env.INFURA_MAINNET),
      network_id: '1',
      gasPrice: 10000000000,
      gas: 4612388
    },
    ropsten: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_ROPSTEN_OWNER, process.env.INFURA_ROPSTEN),
      network_id: '3',
      gasPrice: 50000000000,
      gas: 4700000
    },
    rinkeby: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_RINKEBY_OWNER, process.env.INFURA_RINKEBY),
      network_id: '4',
      gasPrice: 10000000000,
      gas: 6700000
    },
    kovan: {
      provider: () => new HDWalletProvider(process.env.BRAIDED_KOVAN_OWNER, process.env.INFURA_KOVAN),
      network_id: '42',
      gasPrice: 10000000000,
      gas: 4700000
    }
  }
}
