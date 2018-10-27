require('dotenv').config()

module.exports = {
  // Chains are public blockchains
  chains: {
    // mainnet: { client: 'geth', networkID: 1, mode: 'light', chainName: '' },
    mainnet: { client: 'websocket', endpoint: 'ws://localhost:8546' }, // ./bin/geth.mainnet
    // ropsten: { client: 'geth', networkID: 3, mode: 'light', chainName: 'testnet' },
    ropsten: { client: 'websocket', endpoint: 'ws://localhost:8549' }, // ./bin/geth.ropsten
    // ropsten: { client: 'websocket', endpoint: 'wss://ropsten.infura.io/ws' },
    rinkeby: { client: 'geth', networkID: 4, mode: 'fast', chainName: 'rinkeby' },
    kovan: { client: 'parity', networkID: 42, mode: 'light', chainName: 'kovan' } },

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
      providerEndpoint: process.env.INFURA_MAINNET },
    morden: {
      chain: 'morden',
      genesisBlockHash: '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303',
      contractAddress: '0x0000000000000000000000000000000000000000',
      ownerAddress: '0x0000000000000000000000000000000000000000',
      ownerMnemonic: '',
      providerEndpoint: '' },
    ropsten: {
      chain: 'ropsten',
      contractAddress: '0xa60b375aa200949a56c26e99fcff0a0dae6e9a51',
      genesisBlockHash: '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d',
      ownerAddress: '0xb0e5a65bc680659da0715314f96de6b0646baeb3',
      ownerMnemonic: process.env.BRAIDED_ROPSTEN_OWNER,
      providerEndpoint: process.env.INFURA_ROPSTEN },
    // providerEndpoint: 'http://0.0.0.0:3373' },
    rinkeby: {
      chain: 'rinkeby',
      contractAddress: '0xa4f7e95205ac2e79b85528a0b63587bd1d5eff78',
      genesisBlockHash: '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177',
      ownerAddress: '0xf0bf12fa12a78402f821e61b02ee28a186192f9a',
      ownerMnemonic: process.env.BRAIDED_RINKEBY_OWNER,
      providerEndpoint: process.env.INFURA_RINKEBY },
    // providerEndpoint: 'http://0.0.0.0:3374' },
    kovan: {
      chain: 'kovan',
      contractAddress: '0x2f60bb2bbe14f1dfd8146a1469f300a9c313cae1',
      genesisBlockHash: '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9',
      ownerAddress: '0x36feec403513a07239f3a7e4f6751a7e651e330a',
      ownerMnemonic: process.env.BRAIDED_KOVAN_OWNER,
      providerEndpoint: process.env.INFURA_KOVAN }
  },

  // Describes the agents which have permission to add block/hashes to
  // a given strand.
  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails
  agents: [
    // Record one block per day from Ropsten on the mainnet0 strand
    // { braid: 'mainnet',
    //   agentAddress: '0x826803b0f74c279faf4e327f02f7b8fbb751607d',
    //   agentMnemonic: process.env.BRAIDED_MAINNET_AGENT,
    //   watches: {
    //     ropsten: { strand: 3, blocks: 0, seconds: 86400 } } },
    // Record blocks from Mainnet, Rinkeby and Kovan on the ropsten0 strand
    { braid: 'ropsten',
      agentAddress: '0x10a259146c4ac177a74d17591bf83739587a219d',
      agentMnemonic: process.env.BRAIDED_ROPSTEN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 10 },
        rinkeby: { strand: 4, blocks: 200, seconds: 600 },
        kovan: { strand: 42, blocks: 200, seconds: 700 } } },
    // Record blocks from Mainnet, Ropsten and Kovan on the rinkeby0 strand
    { braid: 'rinkeby',
      agentAddress: '0xa4a8c40cf200e548305001b9af9965722c70c6ad',
      agentMnemonic: process.env.BRAIDED_RINKEBY_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 11 },
        ropsten: { strand: 3, blocks: 21, seconds: 120 },
        kovan: { strand: 42, blocks: 31, seconds: 130 } } },
    // Record blocks from Mainnet, Ropsten and Rinkeby on the kovan0 strand
    { braid: 'kovan',
      agentAddress: '0x4487f27ad58abbf8f3b25ee38aba578bc979f67e',
      agentMnemonic: process.env.BRAIDED_KOVAN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 12 },
        ropsten: { strand: 3, blocks: 12, seconds: 95 },
        rinkeby: { strand: 4, blocks: 22, seconds: 105 } } }
  ]
}
