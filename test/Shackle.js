/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const Shackle = artifacts.require('../contracts/Shackle.sol')
const expectThrow = require('./helpers/expectThrow.js')
const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-as-promised'))
  .should()

contract('Shackle', (accounts) => {
  let shackle

  // Network IDs
  const mainnetID = 1
  const mordenID = 2
  const ropstenID = 3
  const kovanID = 4
  const rinkebyID = 42
  const classicID = 10001 // this is made up. Classic folks would insist this is "1"

  // genesis block hashes
  const mainnetGenesis = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
  const mordenGenesis = '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303'
  const ropstenGenesis = '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d'
  const kovanGenesis = '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9'
  const rinkebyGenesis = '0x6341fd3daf94b748c72ced5a5b26028f2474f5f00d824504e4fa37a75767e177'

  before(async () => {
    shackle = await Shackle.new()
  })

  // Test linking multiple testnets together
  context('Link testnets', () => {
    it('should add chains', async () => {
      await shackle.addChain(mainnetID, mainnetGenesis, 'Ethereum Foundation mainnet')
      await shackle.addChain(mordenID, mordenGenesis, 'Ethereum Classic morden testnet')
      await shackle.addChain(ropstenID, ropstenGenesis, 'Ropsten testnet')
      await shackle.addChain(kovanID, kovanGenesis, 'Kovan testnet')
      await shackle.addChain(rinkebyID, rinkebyGenesis, 'Rinkeby testnet')
      await shackle.addChain(classicID, mainnetGenesis, 'Ethereum Classic mainnet');
      (await shackle.getChainCount()).toNumber().should.be.eq(6)
    })

    it('should not allow chain ID 0', async () => {
      await expectThrow(shackle.addChain(0, '0x00', 'zero'))
    })

    it('should get chain info per ID', async () => {
      (await shackle.getChainGenesisBlockHashByChainID(mainnetID)).should.be.eq(mainnetGenesis)
      String(await shackle.getChainDescriptionByChainID(ropstenID)).should.be.eq('Ropsten testnet')
      await expectThrow(shackle.getChainGenesisBlockHashByChainID(33))
      await expectThrow(shackle.getChainDescriptionByChainID(83))
    })

    it('should not allow a duplicate chain with the same ID', async () => {
      await expectThrow(shackle.addChain(mainnetID, '0x9909', 'Dup'));
      // make sure unmodified
      (await shackle.getChainGenesisBlockHashByChainID(mainnetID)).should.be.eq(mainnetGenesis)
    })

    it('should add hashes', async () => {
      await shackle.recordBlock(mainnetID, 1, '0x1010101')
      await shackle.recordBlock(ropstenID, 1, '0x3030303')
      // invalid chain
      await expectThrow(shackle.recordBlock(5, 1, '0x2020202'))
    })

    xit('should retrieve hashes for block numbers', async () => {
    })

    xit('should require increasing block numbers for any given chain', async () => {
    })
  })
})
