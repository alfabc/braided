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

  // Other block hashes of note
  const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'
  // these are real hashes for these block numbers, btw
  const mainnet1 = '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6'
  const mainnet2 = '0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9'
  const mainnet3 = '0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741'
  const mainnet8 = '0x2ce94342df186bab4165c268c43ab982d360c9474f429fec5565adfc5d1f258b'
  const mainnet9 = '0x997e47bf4cac509c627753c06385ac866641ec6f883734ff7944411000dc576e'
  const ropsten1 = '0x41800b5c3f1717687d85fc9018faac0a6e90b39deaa0b99e7fe4fe796ddeb26a'
  const ropsten2 = '0x88e8bc1dd383672e96d77ee247e7524622ff3b15c337bd33ef602f15ba82d920'

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
      await expectThrow(shackle.addChain(0, zero, 'ZE'))
    })

    it('should get chain info per ID', async () => {
      (await shackle.getChainGenesisBlockHashByChainID(mainnetID)).should.be.eq(mainnetGenesis)
      String(await shackle.getChainDescriptionByChainID(ropstenID)).should.be.eq('Ropsten testnet')
      await expectThrow(shackle.getChainGenesisBlockHashByChainID(33))
      await expectThrow(shackle.getChainDescriptionByChainID(83))
    })

    it('should not allow a duplicate chain with the same ID', async () => {
      await expectThrow(shackle.addChain(mainnetID, zero, 'Dup'));
      // ensure unmodified
      (await shackle.getChainGenesisBlockHashByChainID(mainnetID)).should.be.eq(mainnetGenesis)
    })

    it('should add hashes', async () => {
      await shackle.addBlock(mainnetID, 1, mainnet1)
      await shackle.addBlock(mainnetID, 2, mainnet2)
      await shackle.addBlock(mainnetID, 3, mainnet3)
      await shackle.addBlock(ropstenID, 1, ropsten1)
      await shackle.addBlock(ropstenID, 2, ropsten2)
      await shackle.addBlock(classicID, 1, mainnet1)
      // invalid chain
      await expectThrow(shackle.addBlock(5, 1, mainnet1))
    })

    it('should retrieve highest block number in a chain', async () => {
      (await shackle.getHighestBlockNumber(mainnetID)).toNumber().should.be.eq(3);
      (await shackle.getHighestBlockNumber(ropstenID)).toNumber().should.be.eq(2);
      (await shackle.getHighestBlockNumber(classicID)).toNumber().should.be.eq(1)
    })

    it('should not retrieve highest block number for invalid chains', async () => {
      await expectThrow(shackle.getHighestBlockNumber(5))
    })

    it('should not retrieve highest block number for empty chains', async () => {
      await expectThrow(shackle.getHighestBlockNumber(kovanID))
    })

    it('should retrieve hashes for specific block numbers', async () => {
      (await shackle.getBlockHash(mainnetID, 1)).should.be.eq(mainnet1);
      (await shackle.getBlockHash(mainnetID, 2)).should.be.eq(mainnet2);
      (await shackle.getBlockHash(mainnetID, 3)).should.be.eq(mainnet3);
      (await shackle.getBlockHash(ropstenID, 1)).should.be.eq(ropsten1);
      (await shackle.getBlockHash(ropstenID, 2)).should.be.eq(ropsten2);
      (await shackle.getBlockHash(classicID, 1)).should.be.eq(mainnet1)
    })

    it('should require increasing block numbers for any given chain', async () => {
      await shackle.addBlock(mainnetID, 9, mainnet9)
      await expectThrow(shackle.addBlock(mainnetID, 8, mainnet8))
    })

    it('should not retrieve hashes for nonexistent block numbers', async () => {
      await expectThrow(shackle.getBlockHash(mainnetID, 8))
    })
  })
})
