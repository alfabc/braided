module.exports = {
  chains: [
    { id: 'mainnet', client: 'geth', networkID: 1, clientChainName: '' },
    { id: 'ropsten', client: 'geth', networkID: 3, clientChainName: 'testnet' },
    { id: 'rinkeby', client: 'geth', networkID: 4, clientChainName: 'rinkeby' },
    { id: 'kovan', client: 'parity', networkID: 42, clientChainName: 'kovan' }],

  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails
  agents: [
    // Record one block per day from Ropsten on Mainnet
    { chain: 'mainnet',
      braidedContract: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: [
        { chain: 'ropsten', blocks: 0, seconds: 86400 }] },
    // Record every single block from Mainnet, Rinkeby and Kovan on Ropsten
    { chain: 'ropsten',
      braidedContract: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: [
        { chain: 'mainnet', blocks: 0, seconds: 0 },
        { chain: 'rinkeby', blocks: 0, seconds: 0 },
        { chain: 'kovan', blocks: 0, seconds: 0 }] },
    // Record every single block from Mainnet, Ropsten and Kovan on Rinkeby
    { chain: 'rinkeby',
      braidedContract: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: [
        { chain: 'mainnet', blocks: 0, seconds: 0 },
        { chain: 'ropsten', blocks: 0, seconds: 0 },
        { chain: 'kovan', blocks: 0, seconds: 0 }] },
    // Record every single block from Mainnet, Ropsten and Kovan on Kovan
    { chain: 'kovan',
      braidedContract: '0x00C8Bc664147389328Cb56f0b1EDc391c591191f',
      watch: [
        { chain: 'mainnet', blocks: 0, seconds: 0 },
        { chain: 'ropsten', blocks: 0, seconds: 0 },
        { chain: 'rinkeby', blocks: 0, seconds: 0 }] }
  ]
}
