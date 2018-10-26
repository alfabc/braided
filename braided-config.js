require('dotenv').config()

module.exports = {
  // Chains are public blockchains
  chains: {
    // mainnet: { client: 'geth', networkID: 1, mode: 'light', chainName: '' },
    mainnet: { client: 'websocket', endpoint: 'ws://localhost:8546' }, // ./bin/geth.mainnet
    // ropsten: { client: 'geth', networkID: 3, mode: 'light', chainName: 'testnet' },
    // ropsten: { client: 'websocket', endpoint: 'ws://localhost:8549' }, // ./bin/geth.ropsten
    ropsten: { client: 'websocket', endpoint: 'wss://ropsten.infura.io/ws' },
    rinkeby: { client: 'geth', networkID: 4, mode: 'light', chainName: 'rinkeby' },
    kovan: { client: 'parity', networkID: 42, mode: 'light', chainName: 'kovan' } },

  // Braids are deployed Braided contracts on public blockchains
  // There can be multiple strands deployed on a single chain; old versions,
  // abandoned, competing, forked, etc.
  braids: {
    mainnet0: {
      chain: 'mainnet',
      contractAddress: '0x0000000000000000000000000000000000000000',
      genesisBlockHash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      ownerAddress: '0x5160b2f588debd7d131a8f8b4649bf9ac7bfcd59',
      ownerMnemonic: process.env.BRAIDED_MAINNET_OWNER },
    morden0: {
      chain: 'morden',
      genesisBlockHash: '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303',
      contractAddress: '0x0000000000000000000000000000000000000000',
      ownerAddress: '0x0000000000000000000000000000000000000000',
      ownerMnemonic: ''},
    ropsten0: {
      chain: 'ropsten',
      contractAddress: '0x6a8b46Ce6d0F629a82ab97E580c8Ea3100bE3ffE',
      genesisBlockHash: '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d',
      ownerAddress: '0xb0e5a65bc680659da0715314f96de6b0646baeb3',
      ownerMnemonic: process.env.BRAIDED_ROPSTEN_OWNER },
    rinkeby0: {
      chain: 'rinkeby',
      contractAddress: '0x2eF96AEeadAb8C8005c83A1499388F01646D11b0',
      genesisBlockHash: '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177',
      ownerAddress: '0xf0bf12fa12A78402f821E61b02eE28a186192f9A',
      ownerMnemonic: process.env.BRAIDED_RINKEBY_OWNER },
    kovan0: {
      chain: 'kovan',
      contractAddress: '0x0000000000000000000000000000000000000000',
      genesisBlockHash: '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9',
      ownerAddress: '0x36feec403513a07239f3a7e4f6751a7e651e330a',
      ownerMnemonic: process.env.BRAIDED_KOVAN_OWNER }
  },

  // Describes the agents which have permission to add block/hashes to
  // a given strand.
  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails
  agents: [
    // Record one block per day from Ropsten on the mainnet0 strand
    // { braid: 'mainnet0',
    //   agentAddress: '0x826803b0f74c279faf4e327f02f7b8fbb751607d',
    //   agentMnemonic: process.env.BRAIDED_MAINNET_AGENT,
    //   watches: {
    //     ropsten: { strand: 3, blocks: 0, seconds: 86400 } } },
    // Record blocks from Mainnet, Rinkeby and Kovan on the ropsten0 strand
    { braid: 'ropsten0',
      agentAddress: '0x10a259146c4ac177a74d17591bf83739587a219d',
      agentMnemonic: process.env.BRAIDED_ROPSTEN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 10 },
        rinkeby: { strand: 4, blocks: 2, seconds: 20 },
        kovan: { strand: 42, blocks: 3, seconds: 30 } } },
    // Record blocks from Mainnet, Ropsten and Kovan on the rinkeby0 strand
    { braid: 'rinkeby0',
      agentAddress: '0xa4a8c40cf200e548305001b9af9965722c70c6ad',
      agentMnemonic: process.env.BRAIDED_RINKEBY_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 11 },
        ropsten: { strand: 3, blocks: 2, seconds: 21 },
        kovan: { strand: 42, blocks: 3, seconds: 31 } } },
    // Record blocks from Mainnet, Ropsten and Rinkeby on the kovan0 strand
    { braid: 'kovan0',
      agentAddress: '0x4487f27ad58abbf8f3b25ee38aba578bc979f67e',
      agentMnemonic: process.env.BRAIDED_KOVAN_AGENT,
      watches: {
        // mainnet: { strand: 1, blocks: 1, seconds: 12 },
        ropsten: { strand: 3, blocks: 2, seconds: 22 },
        rinkeby: { strand: 4, blocks: 3, seconds: 32 } } }
  ]
}
