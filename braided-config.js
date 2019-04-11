require('dotenv').config()

module.exports = {
  // Chains are public blockchains
  chains: {
    // mainnet: { client: 'geth', networkID: 1, mode: 'light', chainName: '' },
    // mainnet: { client: 'rpc', endpoint: 'http://localhost:8545' },
    // mainnet: { client: 'websocket', endpoint: 'ws://localhost:8546' },
    // mainnet: { client: 'ipc', endpoint: '/home/cleduc/.ethereum/geth.ipc' },
    // ropsten: { client: 'geth', networkID: 3, mode: 'light', chainName: 'testnet' },
    // ropsten: { client: 'rpc', endpoint: 'ws://localhost:8549' },
    // ropsten: { client: 'websocket', endpoint: 'ws://localhost:8550' },
    // ropsten: { client: 'websocket', endpoint: 'wss://ropsten.infura.io/ws' },
    ropsten: { client: 'ipc', endpoint: '/home/cleduc/.ethereum/testnet/geth.ipc' },
    // rinkeby: { client: 'geth', networkID: 4, mode: 'light', chainName: 'rinkeby' },
    // rinkeby: { client: 'rpc', endpoint: 'http://localhost:8551' },
    // rinkeby: { client: 'websocket', endpoint: 'ws://localhost:8552' },
    // rinkeby: { client: 'websocket', endpoint: 'wss://rinkeby.infura.io/ws' },
    rinkeby: { client: 'ipc', endpoint: '/home/cleduc/.ethereum/rinkeby/geth.ipc' },
    // goerli: { client: 'geth', networkID: 5, mode: 'light', chainName: 'rinkeby' },
    // goerli: { client: 'rpc', endpoint: 'http://localhost:8553' },
    // goerli: { client: 'websocket', endpoint: 'ws://localhost:8554' },
    goerli: { client: 'ipc', endpoint: '/home/cleduc/.ethereum/goerli/geth.ipc' },
    // kovan: { client: 'parity', networkID: 42, mode: 'light', chainName: 'kovan' } },
    // kovan: { client: 'rpc', endpoint: 'ws://localhost:8555' } },
    // kovan: { client: 'websocket', endpoint: 'ws://localhost:8556' } },
    kovan: { client: 'ipc', endpoint: '/home/cleduc/.local/share/io.parity.ethereum/jsonrpc.ipc' } },

  // Braids are deployed Braided contracts on public blockchains
  // There can be multiple strands deployed on a single chain; old versions,
  // abandoned, competing, forked, etc.
  braids: {
    mainnet: {
      chain: 'mainnet',
      contractAddress: '0x0000000000000000000000000000000000000000',
      genesisBlockHash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      ownerAddress: '0x5160b2f588debd7d131a8f8b4649bf9ac7bfcd59',
      ownerMnemonic: process.env.BRAIDED_MAINNET_OWNER,
      // providerEndpoint: process.env.INFURA_MAINNET },
      // providerEndpoint: '/home/cleduc/.ethereum/geth.ipc' },
      providerEndpoint: 'http://127.0.0.1:8545' },
    // morden: {
    // chain: 'morden',
    // genesisBlockHash: '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303',
    // contractAddress: '0x0000000000000000000000000000000000000000',
    // ownerAddress: '0x0000000000000000000000000000000000000000',
    // ownerMnemonic: '',
    // providerEndpoint: '' },
    ropsten: {
      chain: 'ropsten',
      contractAddress: '0xa60b375aa200949a56c26e99fcff0a0dae6e9a51',
      genesisBlockHash: '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d',
      ownerAddress: '0xb0e5a65bc680659da0715314f96de6b0646baeb3',
      ownerMnemonic: process.env.BRAIDED_ROPSTEN_OWNER,
      // providerEndpoint: process.env.INFURA_ROPSTEN },
      // providerEndpoint: '/home/cleduc/.ethereum/testnet/geth.ipc' },
      providerEndpoint: 'http://127.0.0.1:8549' },
    rinkeby: {
      chain: 'rinkeby',
      contractAddress: '0xa4f7e95205ac2e79b85528a0b63587bd1d5eff78',
      genesisBlockHash: '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177',
      ownerAddress: '0xf0bf12fa12a78402f821e61b02ee28a186192f9a',
      ownerMnemonic: process.env.BRAIDED_RINKEBY_OWNER,
      // providerEndpoint: process.env.INFURA_RINKEBY },
      // providerEndpoint: '/home/cleduc/.ethereum/rinkeby/geth.ipc' },
      providerEndpoint: 'http://127.0.0.1:8551' },
    goerli: {
      chain: 'goerli',
      contractAddress: '0x7ef66b77759e12Caf3dDB3E4AFF524E577C59D8D',
      genesisBlockHash: '0xbf7e331f7f7c1dd2e05159666b3bf8bc7a8a3a9eb1d518969eab529dd9b88c1a',
      ownerAddress: '0xf0bf12fa12a78402f821e61b02ee28a186192f9a',
      ownerMnemonic: process.env.BRAIDED_GOERLI_OWNER,
      // providerEndpoint: process.env.INFURA_GOERLI },
      // providerEndpoint: '/home/cleduc/.ethereum/goerli/geth.ipc' },
      providerEndpoint: 'http://127.0.0.1:8553' },
    kovan: {
      chain: 'kovan',
      contractAddress: '0x2f60bb2bbe14f1dfd8146a1469f300a9c313cae1',
      genesisBlockHash: '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9',
      ownerAddress: '0x36feec403513a07239f3a7e4f6751a7e651e330a',
      ownerMnemonic: process.env.BRAIDED_KOVAN_OWNER,
      // providerEndpoint: process.env.INFURA_KOVAN }
      // providerEndpoint: '/home/cleduc/.local/share/io.parity.ethereum/jsonrpc.ipc' }
      providerEndpoint: 'http://127.0.0.1:8555' }
  },

  // Describes the agents which have permission to add block/hashes to
  // a given strand.
  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails, except for `special`
  // which is included if the remainder of dividing the block number is zero
  // This helps multiple strands record the same block numbers, even when
  // their intervals are different.
  agents: [
    // Record one block per day from Ropsten on the mainnet0 strand
    // { braid: 'mainnet',
    //   agentAddress: '0x826803b0f74c279faf4e327f02f7b8fbb751607d',
    //   agentMnemonic: process.env.BRAIDED_MAINNET_AGENT,
    //   watches: {
    //     ropsten: { strand: 3, blocks: 0, seconds: 86400, special: 1000 } } },
    // Record blocks from Mainnet, Rinkeby and Kovan on the ropsten0 strand
    { braid: 'ropsten',
      agentAddress: '0x10a259146c4ac177a74d17591bf83739587a219d',
      agentMnemonic: process.env.BRAIDED_ROPSTEN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 10, special: 1000 },
        rinkeby: { strand: 4, blocks: 131, seconds: 2000, special: 300 },
        kovan: { strand: 42, blocks: 31, seconds: 450, special: 500 } } },
    // Record blocks from Mainnet, Ropsten and Kovan on the rinkeby0 strand
    { braid: 'rinkeby',
      agentAddress: '0xa4a8c40cf200e548305001b9af9965722c70c6ad',
      agentMnemonic: process.env.BRAIDED_RINKEBY_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 11, special: 1000 },
        ropsten: { strand: 3, blocks: 31, seconds: 450, special: 100 },
        kovan: { strand: 42, blocks: 17, seconds: 225, special: 100 } } },
    // Record blocks from Mainnet, Ropsten, Rinkeby and Kovan on the goerli0 strand
    { braid: 'goerli',
      agentAddress: '0x79047aBf3af2a1061B108D71d6dc7BdB06474790',
      agentMnemonic: process.env.BRAIDED_GOERLI_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 32, seconds: 450, special: 100 },
        ropsten: { strand: 3, blocks: 33, seconds: 450, special: 100 },
        rinkeby: { strand: 4, blocks: 35, seconds: 450, special: 100 },
        kovan: { strand: 42, blocks: 37, seconds: 450, special: 100 } } },
    // Record blocks from Mainnet, Ropsten and Rinkeby on the kovan0 strand
    { braid: 'kovan',
      agentAddress: '0x4487f27ad58abbf8f3b25ee38aba578bc979f67e',
      agentMnemonic: process.env.BRAIDED_KOVAN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 12, special: 1000 },
        ropsten: { strand: 3, blocks: 13, seconds: 200, special: 50 },
        rinkeby: { strand: 4, blocks: 17, seconds: 225, special: 50 } } }
  ]
}
