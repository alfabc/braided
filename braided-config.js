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

  // Strands are deployed Braided contracts on public blockchains
  // There can be multiple strands deployed on a single chain; old versions,
  // abandoned, competing, forked, etc.
  strands: {
    mainnet0: {
      chain: 'mainnet',
      contractAddress: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f' },
    ropsten0: {
      chain: 'ropsten',
      contractAddress: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f' },
    rinkeby0: {
      chain: 'rinkeby',
      contractAddress: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f' },
    kovan0: {
      chain: 'kovan',
      contractAddress: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f' }
  },

  // Describes the agents which have permission to add block/hashes to
  // a given strand.
  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails
  agents: [
    // Record one block per day from Ropsten on the mainnet0 strand
    // { strand: 'mainnet0',
    //   address: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
    //   watch: [
    //     { chain: 'ropsten', blocks: 0, seconds: 86400 }] },
    // Record blocks from Mainnet, Rinkeby and Kovan on the ropsten0 strand
    { strand: 'ropsten0',
      address: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: {
        mainnet: { blocks: 1, seconds: 10 },
        rinkeby: { blocks: 2, seconds: 20 },
        kovan: { blocks: 3, seconds: 30 } } },
    // Record blocks from Mainnet, Ropsten and Kovan on the rinkeby0 strand
    { strand: 'rinkeby0',
      address: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: {
        mainnet: { blocks: 1, seconds: 11 },
        ropsten: { blocks: 2, seconds: 21 },
        kovan: { blocks: 3, seconds: 31 } } },
    // Record blocks from Mainnet, Ropsten and Rinkeby on the kovan0 strand
    { strand: 'kovan0',
      address: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: {
        mainnet: { blocks: 1, seconds: 12 },
        ropsten: { blocks: 2, seconds: 22 },
        rinkeby: { blocks: 3, seconds: 32 } } }
  ]
}
