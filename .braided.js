module.exports = {
  chains: [
    {id: 'mainnet', client: 'geth', networkID: 1, clientChainName: ''},
    {id: 'ropsten', client: 'geth', networkID: 3, clientChainName: 'testnet'},
    {id: 'rinkeby', client: 'geth', networkID: 4, clientChainName: 'rinkeby'},
    {id: 'kovan', client: 'parity', networkID: 42, clientChainName: 'kovan'}],

  // write chain, [read chains, block count interval, seconds interval]
  // interval "0" means every block or every second (no delay)
  // both apply; longest of the two prevails
  agents: [
    // Record one block per day from Ropsten on Mainnet
    ['mainnet', '0x00C8Bc664147389328Cb56f0b1EDc391c591191f'
      ['ropsten', 0, 86400]],
    // Record every single block from Mainnet, Rinkeby and Kovan on Ropsten
    ['ropsten', '0x00C8Bc664147389328Cb56f0b1EDc391c591191f'
      ['mainnet', 0, 0],
      ['rinkeby', 0, 0],
      ['kovan', 0, 0]],
    // Record every single block from Mainnet, Ropsten and Kovan on Rinkeby
    ['rinkeby', '0x00C8Bc664147389328Cb56f0b1EDc391c591191f'
      ['mainnet', 0, 0],
      ['ropsten', 0, 0],
      ['kovan', 0, 0]],
    // Record every single block from Mainnet, Ropsten and Kovan on Kovan
    ['kovan', '0x00C8Bc664147389328Cb56f0b1EDc391c591191f'
      ['mainnet', 0, 0],
      ['ropsten', 0, 0],
      ['rinkeby', 0, 0]]
  ]
};
