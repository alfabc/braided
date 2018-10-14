/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const Braided = artifacts.require('../contracts/Braided.sol')
const expectThrow = require('./helpers/expectThrow.js')
const BigNumber = require('bignumber.js')
const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should()

contract('Braided', (accounts) => {
  let braided

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
  const mainneta = '0x4ff4a38b278ab49f7739d3a4ed4e12714386a9fdf72192f2e8f7da7822f10b4d'
  const ropsten1 = '0x41800b5c3f1717687d85fc9018faac0a6e90b39deaa0b99e7fe4fe796ddeb26a'
  const ropsten2 = '0x88e8bc1dd383672e96d77ee247e7524622ff3b15c337bd33ef602f15ba82d920'

  before(async () => {
    braided = await Braided.new()
  })

  // Exercises use of openzeppelin-solidity/Superuser
  context('ownership and permissions', () => {
    it('should not allow non-superuser/non-owner to set new owner', async () => {
      await expectThrow(braided.transferOwnership(rando, { from: rando }))
    })

    it('should allow superuser/owner to set new owner', async () => {
      await braided.transferOwnership(owner1, { from: superuser })
    })

    it('should allow owner to set new owner', async () => {
      await braided.transferOwnership(owner2, { from: owner1 })
    })

    it('should allow superuser to set new owner', async () => {
      await braided.transferOwnership(owner1, { from: superuser })
    })
  })

  // Test linking multiple testnets together
  context('Link testnets', () => {
    it('should add strands', async () => {
      await braided.addStrand(mainnetID, braided.contract.address, mainnetGenesis, 'Foundation', { from: superuser })
      await braided.addStrand(mordenID, braided.contract.address, mordenGenesis, 'morden', { from: owner1 })
      await braided.addStrand(ropstenID, braided.contract.address, ropstenGenesis, 'Ropsten', { from: superuser })
      await braided.addStrand(kovanID, braided.contract.address, kovanGenesis, 'Kovan', { from: owner1 })
      await braided.addStrand(rinkebyID, braided.contract.address, rinkebyGenesis, 'Rinkeby', { from: owner1 })
      await braided.addStrand(classicID, braided.contract.address, mainnetGenesis, 'Classic', { from: owner1 })
      await braided.addStrand(classictestID, braided.contract.address, mordenGenesis, 'Classic test', { from: owner1 });
      (await braided.getStrandCount()).toNumber().should.be.eq(7)
    })

    it('should not allow strand ID 0', async () => {
      await expectThrow(braided.addStrand(0, braided.contract.address, zero, 'zero'))
    })

    it('should not allow non-owner to add strand', async () => {
      await expectThrow(braided.addStrand(7, braided.contract.address, mainnetGenesis, 'unlucky', { from: agent1 }))
    })

    it('should get strand info per ID', async () => {
      (await braided.getStrandGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
      String(await braided.getStrandDescription(ropstenID)).should.be.eq('Ropsten')
      String(await braided.getStrandContract(ropstenID)).should.be.eq(braided.contract.address)
      await expectThrow(braided.getStrandGenesisBlockHash(33))
      await expectThrow(braided.getStrandDescription(83))
    })

    it('should not allow a duplicate strand with the same ID', async () => {
      await expectThrow(braided.addStrand(mainnetID, braided.contract.address, zero, 'Dup', { from: owner1 }));
      // ensure unmodified
      (await braided.getStrandGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
    })
  })

  context('Add agents', () => {
    it('should add strands', async () => {
      await braided.addAgent(agent1, mainnetID, { from: owner1 })
      await braided.addAgent(agent2, mainnetID, { from: owner1 })
    })

    it('should allow superuser to add agents', async () => {
      await braided.addAgent(agent3, mainnetID, { from: superuser })
      await braided.addAgent(agent4, mainnetID, { from: superuser })
      await braided.addAgent(agent4, ropstenID, { from: superuser })
      await braided.addAgent(agent4, classicID, { from: superuser })
    })

    it('should not allow non-superuser/non-owner to add agent', async () => {
      await expectThrow(braided.addAgent(agent1, mainnetID, { from: owner2 }))
    })

    it('should allow superuser to remove agent', async () => {
      await braided.removeAgent(agent2, mainnetID, { from: superuser })
    })

    it('should allow owner to remove agent', async () => {
      await braided.removeAgent(agent3, mainnetID, { from: owner1 })
    })

    it('should not allow non-superuser/non-owner to remove agent', async () => {
      await expectThrow(braided.addAgent(agent1, mainnetID, { from: owner2 }))
    })
  })

  context('set and get hashes', () => {
    it('should allow agents to add hashes', async () => {
      await braided.addBlock(mainnetID, 1, mainnet1, { from: agent1 })
      await braided.addBlock(mainnetID, 2, mainnet2, { from: agent1 })
      await braided.addBlock(mainnetID, 3, mainnet3, { from: agent1 })
      await braided.addBlock(ropstenID, 1, ropsten1, { from: agent4 })
      await braided.addBlock(ropstenID, 2, ropsten2, { from: agent4 })
      await braided.addBlock(classicID, 1, mainnet1, { from: agent4 })
      // but not on an invalid strand
      await expectThrow(braided.addBlock(5, 1, mainnet1, { from: agent1 }))
    })

    it('should not allow non-agents to add hashes', async () => {
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: superuser }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: owner2 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: agent2 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: agent3 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: rando }))
    })

    it('should retrieve highest block number in a strand', async () => {
      (await braided.getHighestBlockNumber(mainnetID)).toNumber().should.be.eq(3);
      (await braided.getHighestBlockNumber(ropstenID)).toNumber().should.be.eq(2);
      (await braided.getHighestBlockNumber(classicID)).toNumber().should.be.eq(1)
    })

    it('should not retrieve highest block number for invalid strands', async () => {
      await expectThrow(braided.getHighestBlockNumber(5))
    })

    it('should not retrieve highest block number for empty strands', async () => {
      await expectThrow(braided.getHighestBlockNumber(kovanID))
    })

    it('should retrieve hashes for specific block numbers', async () => {
      (await braided.getBlockHash(mainnetID, 1)).should.be.eq(mainnet1);
      (await braided.getBlockHash(mainnetID, 2)).should.be.eq(mainnet2);
      (await braided.getBlockHash(mainnetID, 3)).should.be.eq(mainnet3);
      (await braided.getBlockHash(ropstenID, 1)).should.be.eq(ropsten1);
      (await braided.getBlockHash(ropstenID, 2)).should.be.eq(ropsten2);
      (await braided.getBlockHash(classicID, 1)).should.be.eq(mainnet1)
    })

    it('should require increasing block numbers for any given strand', async () => {
      await braided.addBlock(mainnetID, 9, mainnet9, { from: agent1 })
      await expectThrow(braided.addBlock(mainnetID, 8, mainnet8, { from: agent1 }))
    })

    it('should not retrieve hashes for nonexistent block numbers', async () => {
      await expectThrow(braided.getBlockHash(mainnetID, 8))
      await expectThrow(braided.getBlockHash(mainnetID, 0))
    })

    it('should get previous block number', async () => {
      (await braided.getPreviousBlockNumber(mainnetID, 9)).toNumber().should.be.eq(3)
    })

    it('should get previous block', async () => {
      let block = await braided.getPreviousBlock(mainnetID, 9)
      block[0].toNumber().should.be.eq(3)
      block[1].should.be.eq(mainnet3)
    })

    it('should fail to get previous block number for unrecorded blocks', async () => {
      await expectThrow(braided.getPreviousBlockNumber(mainnetID, 8))
      await expectThrow(braided.getPreviousBlockNumber(mainnetID, 0))
      await expectThrow(braided.getPreviousBlockNumber(mainnetID, 11))
    })

    it('should fail to get previous block for unrecorded blocks', async () => {
      await expectThrow(braided.getPreviousBlock(mainnetID, 8))
      await expectThrow(braided.getPreviousBlock(mainnetID, 0))
      await expectThrow(braided.getPreviousBlock(mainnetID, 11))
    })

    it('should emit an event when adding a block', async () => {
      let tx = await braided.addBlock(mainnetID, 10, mainneta, { from: agent1 })
      tx.logs[0].event.should.be.equal('BlockAdded')
      tx.logs[0].args.strandID.toNumber().should.be.eq(mainnetID)
      tx.logs[0].args.blockNumber.toNumber().should.be.eq(10)
      tx.logs[0].args.blockHash.should.be.eq(mainneta)
    })
  })
})
