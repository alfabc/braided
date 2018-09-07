/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const ChainBlockHashes = artifacts.require('../contracts/ChainBlockHashes.sol')
const expectThrow = require('./helpers/expectThrow.js')
const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-as-promised'))
  .should()

contract('ChainBlockHashes', (accounts) => {
  let shackle

  // users
  const superuser = accounts[0]
  const owner1 = accounts[1]
  const owner2 = accounts[2]
  const agent1 = accounts[3]
  const agent2 = accounts[4]
  const agent3 = accounts[5]
  const agent4 = accounts[6]
  const rando = accounts[7]

  // Network IDs (from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md)
  const mainnetID = 1
  const mordenID = 2
  const ropstenID = 3
  const rinkebyID = 4
  const kovanID = 42
  const classicID = 61
  const classictestID = 62

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
    shackle = await ChainBlockHashes.new()
  })

  // Exercises use of openzeppelin-solidity/Superuser
  context('ownership and permissions', () => {
    it('should not allow non-superuser/non-owner to set new owner', async () => {
      await expectThrow(shackle.transferOwnership(rando, { from: rando }))
    })

    it('should allow superuser/owner to set new owner', async () => {
      await shackle.transferOwnership(owner1, { from: superuser })
    })

    it('should allow owner to set new owner', async () => {
      await shackle.transferOwnership(owner2, { from: owner1 })
    })

    it('should allow superuser to set new owner', async () => {
      await shackle.transferOwnership(owner1, { from: superuser })
    })

    it('should allow owner to add agents', async () => {
      await shackle.addAgent(agent1, { from: owner1 })
      await shackle.addAgent(agent2, { from: owner1 })
    })

    it('should allow superuser to add agents', async () => {
      await shackle.addAgent(agent3, { from: superuser })
      await shackle.addAgent(agent4, { from: superuser })
    })

    it('should not allow non-superuser/non-owner to add agent', async () => {
      await expectThrow(shackle.addAgent(agent1, { from: owner2 }))
    })

    it('should allow superuser to remove agent', async () => {
      await shackle.removeAgent(agent2, { from: superuser })
    })

    it('should allow owner to remove agent', async () => {
      await shackle.removeAgent(agent3, { from: owner1 })
    })

    it('should not allow non-superuser/non-owner to remove agent', async () => {
      await expectThrow(shackle.addAgent(agent1, { from: owner2 }))
    })
  })

  // Test linking multiple testnets together
  context('Link testnets', () => {
    it('should add chains', async () => {
      await shackle.addChain(mainnetID, mainnetGenesis, 'Foundation', { from: superuser })
      await shackle.addChain(mordenID, mordenGenesis, 'morden', { from: owner1 })
      await shackle.addChain(ropstenID, ropstenGenesis, 'Ropsten', { from: superuser })
      await shackle.addChain(kovanID, kovanGenesis, 'Kovan', { from: owner1 })
      await shackle.addChain(rinkebyID, rinkebyGenesis, 'Rinkeby', { from: owner1 })
      await shackle.addChain(classicID, mainnetGenesis, 'Classic', { from: owner1 })
      await shackle.addChain(classictestID, mordenGenesis, 'Classic test', { from: owner1 });
      (await shackle.getChainCount()).toNumber().should.be.eq(7)
    })

    it('should not allow chain ID 0', async () => {
      await expectThrow(shackle.addChain(0, zero, 'zero'))
    })

    it('should not allow non-owner to add chain', async () => {
      await expectThrow(shackle.addChain(7, mainnetGenesis, 'unlucky', { from: agent1 }))
    })

    it('should get chain info per ID', async () => {
      (await shackle.getGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
      String(await shackle.getChainDescription(ropstenID)).should.be.eq('Ropsten')
      await expectThrow(shackle.getGenesisBlockHash(33))
      await expectThrow(shackle.getChainDescription(83))
    })

    it('should not allow a duplicate chain with the same ID', async () => {
      await expectThrow(shackle.addChain(mainnetID, zero, 'Dup', { from: owner1 }));
      // ensure unmodified
      (await shackle.getGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
    })

    it('should allow agents to add hashes', async () => {
      await shackle.addBlock(mainnetID, 1, mainnet1, { from: agent1 })
      await shackle.addBlock(mainnetID, 2, mainnet2, { from: agent1 })
      await shackle.addBlock(mainnetID, 3, mainnet3, { from: agent1 })
      await shackle.addBlock(ropstenID, 1, ropsten1, { from: agent4 })
      await shackle.addBlock(ropstenID, 2, ropsten2, { from: agent4 })
      await shackle.addBlock(classicID, 1, mainnet1, { from: agent4 })
      // but not on an invalid chain
      await expectThrow(shackle.addBlock(5, 1, mainnet1, { from: agent1 }))
    })

    it('should not allow non-agents to add hashes', async () => {
      await expectThrow(shackle.addBlock(classicID, 2, mainnet2, { from: superuser }))
      await expectThrow(shackle.addBlock(classicID, 2, mainnet2, { from: owner2 }))
      await expectThrow(shackle.addBlock(classicID, 2, mainnet2, { from: agent2 }))
      await expectThrow(shackle.addBlock(classicID, 2, mainnet2, { from: agent3 }))
      await expectThrow(shackle.addBlock(classicID, 2, mainnet2, { from: rando }))
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
      await shackle.addBlock(mainnetID, 9, mainnet9, { from: agent1 })
      await expectThrow(shackle.addBlock(mainnetID, 8, mainnet8, { from: agent1 }))
    })

    it('should not retrieve hashes for nonexistent block numbers', async () => {
      await expectThrow(shackle.getBlockHash(mainnetID, 8))
    })
  })
})
