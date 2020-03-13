/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const config = require('../braided-config.js')
const Braided = artifacts.require('../contracts/Braided.sol')
const BraidedPayable = artifacts.require('../contracts/BraidedPayable.sol')
const expectThrow = require('./helpers/expectThrow.js')
const BigNumber = require('bignumber.js')
const should = require('chai') // eslint-disable-line no-unused-vars
  .use(require('chai-bignumber')(BigNumber))
  .use(require('chai-as-promised'))
  .should()
const grant = new BigNumber(web3.utils.toWei('0.1', 'ether'));

// Braided contract should not accept payments
contract('Braided', (accounts) => {
  let braided

  before(async () => {
    braided = await Braided.new();
  })

  context('Braided not payable', () => {
    it('should not receive payments', async () => {
      await expectThrow(web3.eth.sendTransaction({ from: accounts[0], to: braided.address, value: grant }));
    })
  })
})

contract('BraidedPayable', (accounts) => {
  let braided

  // users
  const owner0 = accounts[0]
  const owner1 = accounts[1]
  const owner2 = accounts[2]
  const agent1 = accounts[3]
  const agent2 = accounts[4]
  const agent3 = accounts[5]
  const agent4 = accounts[6]
  const rando = accounts[7]

  // Network IDs (from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md)
  const braidZeroID = 0
  const mainnetID = 1
  const ropstenID = 3
  const rinkebyID = 4
  const goerliID = 5
  const kovanID = 42
  const classicID = 61
  const classictestID = 62
  const invalidID = 99090

  // genesis block hashes
  const mainnetGenesis = config.braids.mainnet.genesisBlockHash
  const ropstenGenesis = config.braids.ropsten.genesisBlockHash
  const rinkebyGenesis = config.braids.rinkeby.genesisBlockHash
  const goerliGenesis = config.braids.goerli.genesisBlockHash
  const kovanGenesis = config.braids.kovan.genesisBlockHash

  // Other block hashes of note
  const zero = '0x0000000000000000000000000000000000000000000000000000000000000000'
  // these are real hashes for these block numbers, btw
  const mainnet1 = '0x88e96d4537bea4d9c05d12549907b32561d3bf31f45aae734cdc119f13406cb6'
  const mainnet2 = '0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9'
  const mainnet3 = '0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741'
  const mainnet8 = '0x2ce94342df186bab4165c268c43ab982d360c9474f429fec5565adfc5d1f258b'
  const mainnet9 = '0x997e47bf4cac509c627753c06385ac866641ec6f883734ff7944411000dc576e'
  const mainneta = '0x4ff4a38b278ab49f7739d3a4ed4e12714386a9fdf72192f2e8f7da7822f10b4d'
  const goerlia = '0x206d138db2c9f30a257fab5ffc593e96ffdd96350842d1501647d24164da4bdf'
  const goerlic = '0x98de0d0a6d58f5da8cb8177e7371e496f37ac6cf2bbf145d0deaaf2d3934915b'
  const goerlie = '0x10aa4db0d143ab9303a20cd99a0f8b4ad9b75a48eec9d62b9475a706acda67f5'
  const ropsten1 = '0x41800b5c3f1717687d85fc9018faac0a6e90b39deaa0b99e7fe4fe796ddeb26a'
  const ropsten2 = '0x88e8bc1dd383672e96d77ee247e7524622ff3b15c337bd33ef602f15ba82d920'

  before(async () => {
    braided = await BraidedPayable.new();
    (await web3.eth.getBlock('latest')).number.should.eq((await braided.getCreationBlockNumber()).toNumber())
  })

  // Exercises use of openzeppelin-solidity/Owner
  context('ownership and permissions', () => {
    it('should not allow non-owner to set new owner', async () => {
      await expectThrow(braided.transferOwnership(rando, { from: rando }))
    })

    it('should allow owner to set new owner', async () => {
      await braided.transferOwnership(owner1, { from: owner0 })
    })

    it('should allow owner to set new owner', async () => {
      await braided.transferOwnership(owner2, { from: owner1 })
    })

    it('should allow owner to set new owner', async () => {
      await braided.transferOwnership(owner1, { from: owner2 })
    })
  })

  // Test linking multiple testnets together
  context('Link testnets', () => {
    it('should add strands', async () => {
      await braided.addStrand(mainnetID, braided.address, mainnetGenesis, 'Foundation', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(mainnetID)).toNumber())
      await braided.addStrand(goerliID, braided.address, goerliGenesis, 'goerli', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(goerliID)).toNumber())
      await braided.addStrand(ropstenID, braided.address, ropstenGenesis, 'Ropsten', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(ropstenID)).toNumber())
      await braided.addStrand(kovanID, braided.address, kovanGenesis, 'Kovan', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(kovanID)).toNumber())
      await braided.addStrand(rinkebyID, braided.address, rinkebyGenesis, 'Rinkeby', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(rinkebyID)).toNumber())
      await braided.addStrand(classicID, braided.address, mainnetGenesis, 'Classic', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(classicID)).toNumber())
      await braided.addStrand(classictestID, braided.address, goerliGenesis, 'Classic test', { from: owner1 });
      (await web3.eth.getBlock('latest')).number.should.eq(
        (await braided.getStrandCreationBlockNumber(classictestID)).toNumber());
      (await braided.getStrandCount()).toNumber().should.be.eq(7)
    })

    it('should not allow strand ID 0', async () => {
      await expectThrow(braided.addStrand(braidZeroID, braided.address, zero, 'zero'))
    })

    it('should not allow non-owner to add strand', async () => {
      await expectThrow(braided.addStrand(7, braided.address, mainnetGenesis, 'unlucky', { from: agent1 }))
    })

    it('should fail to get strand ID by invalid index', async () => {
      await expectThrow(braided.getStrandID(7))
      await expectThrow(braided.getStrandID(8))
    })

    it('should get strand ID by zero-based index', async () => {
      (await braided.getStrandID(0)).toNumber().should.be.eq(mainnetID);
      (await braided.getStrandID(1)).toNumber().should.be.eq(goerliID);
      (await braided.getStrandID(2)).toNumber().should.be.eq(ropstenID);
      (await braided.getStrandID(3)).toNumber().should.be.eq(kovanID);
      (await braided.getStrandID(4)).toNumber().should.be.eq(rinkebyID);
      (await braided.getStrandID(5)).toNumber().should.be.eq(classicID);
      (await braided.getStrandID(6)).toNumber().should.be.eq(classictestID)
    })

    it('should get strand info per ID', async () => {
      (await braided.getStrandGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
      String(await braided.getStrandDescription(ropstenID)).should.be.eq('Ropsten')
      String(await braided.getStrandContract(ropstenID)).should.be.eq(braided.address)
      await expectThrow(braided.getStrandGenesisBlockHash(33))
      await expectThrow(braided.getStrandDescription(83))
    })

    it('should not allow a duplicate strand with the same ID', async () => {
      await expectThrow(braided.addStrand(mainnetID, braided.address, zero, 'Dup', { from: owner1 }));
      // ensure unmodified
      (await braided.getStrandGenesisBlockHash(mainnetID)).should.be.eq(mainnetGenesis)
    })
  })

  context('Add agents', () => {
    it('should add strands', async () => {
      await braided.addAgent(agent1, mainnetID, { from: owner1 })
      await braided.addAgent(agent2, mainnetID, { from: owner1 })
    })

    it('should allow owner to add agents', async () => {
      await braided.addAgent(agent3, mainnetID, { from: owner1 })
      await braided.addAgent(agent4, mainnetID, { from: owner1 })
      await braided.addAgent(agent4, ropstenID, { from: owner1 })
      await braided.addAgent(agent4, classicID, { from: owner1 })
    })

    it('should not allow non-owner to add agent', async () => {
      await expectThrow(braided.addAgent(agent1, mainnetID, { from: owner2 }))
    })

    it('should allow owner to remove agent', async () => {
      await braided.removeAgent(agent2, mainnetID, { from: owner1 })
    })

    it('should allow owner to remove agent', async () => {
      await braided.removeAgent(agent3, mainnetID, { from: owner1 })
    })

    it('should not allow non-owner to remove agent', async () => {
      await expectThrow(braided.addAgent(agent1, mainnetID, { from: owner2 }))
    })
  })

  context('Payments', () => {
    it('should send payments to the owner by default', async () => {
      var balance = new BigNumber(await web3.eth.getBalance(owner1));

      // use regular send to contract from rando
//      await web3.eth.sendTransaction({ from: rando, to: braided.address, value: grant });
//      (await web3.eth.getBalance(owner1)).should.be.bignumber.equal(balance = balance.plus(grant))

      await braided.pay(mainnetID, { from: rando, value: grant });
      (await web3.eth.getBalance(owner1)).should.be.bignumber.equal(balance = balance.plus(grant))

      await braided.pay(classicID, { from: rando, value: grant });
      (await web3.eth.getBalance(owner1)).should.be.bignumber.equal(balance.plus(grant))
    })

    xit('should allow only the owner to set payees', async () => {
      await expectThrow(braided.setPayee(owner2, braidZeroID, { from: owner2 }))
      await expectThrow(braided.setPayee(owner2, braidZeroID, { from: rando }))
      await braided.setPayee(owner2, braidZeroID, { from: owner1 })

      await expectThrow(braided.setPayee(agent1, mainnetID, { from: owner2 }))
      await braided.setPayee(agent1, mainnetID, { from: owner1 })

      await braided.setPayee(agent4, classicID, { from: owner1 })
    })

    xit('should route payment to the correct payee', async () => {
      // use regular send to contract from rando
      // verify it went to owner2

      // get agent1 balance
      await braided.pay(mainnetID, { from: rando })
      // verify it went to agent1

      // get agent4 balance
      await braided.pay(classicID, { from: rando })
      // verify it went to agent4

      // get owner1 balance
      await braided.pay(ropstenID, { from: rando })
      // verify it went to owner1
    })

    xit('should not accept payments for invalid strands', async () => {
      await expectThrow(braided.pay(invalidID, { from: rando }))
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
      await expectThrow(braided.addBlock(invalidID, 1, mainnet1, { from: agent1 }))
    })

    it('should not allow non-agents to add hashes', async () => {
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: owner0 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: owner2 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: agent2 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: agent3 }))
      await expectThrow(braided.addBlock(classicID, 2, mainnet2, { from: rando }))
    })

    it('should retrieve lowest block number in a strand', async () => {
      (await braided.getLowestBlockNumber(mainnetID)).toNumber().should.be.eq(1);
      (await braided.getLowestBlockNumber(ropstenID)).toNumber().should.be.eq(1);
      (await braided.getLowestBlockNumber(classicID)).toNumber().should.be.eq(1)
      await braided.addAgent(agent2, goerliID, { from: owner1 })
      await braided.addBlock(goerliID, 10, goerlia, { from: agent2 })
      await braided.addBlock(goerliID, 12, goerlic, { from: agent2 })
      await braided.addBlock(goerliID, 14, goerlie, { from: agent2 });
      (await braided.getLowestBlockNumber(goerliID)).toNumber().should.be.eq(10)
    })

    it('should retrieve highest block number in a strand', async () => {
      (await braided.getHighestBlockNumber(mainnetID)).toNumber().should.be.eq(3);
      (await braided.getHighestBlockNumber(ropstenID)).toNumber().should.be.eq(2);
      (await braided.getHighestBlockNumber(classicID)).toNumber().should.be.eq(1);
      (await braided.getHighestBlockNumber(goerliID)).toNumber().should.be.eq(14)
    })

    it('should not retrieve highest block number for invalid strands', async () => {
      await expectThrow(braided.getHighestBlockNumber(2))
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

    it('should get the number of blocks recorded for a chain', async () => {
      // invalid strandID
      await expectThrow(braided.getBlockCount(2));
      (await braided.getBlockCount(mainnetID)).toNumber().should.be.eq(4);
      (await braided.getBlockCount(goerliID)).toNumber().should.be.eq(3);
      (await braided.getBlockCount(ropstenID)).toNumber().should.be.eq(2);
      (await braided.getBlockCount(rinkebyID)).toNumber().should.be.eq(0);
      (await braided.getBlockCount(kovanID)).toNumber().should.be.eq(0);
      (await braided.getBlockCount(classicID)).toNumber().should.be.eq(1);
      (await braided.getBlockCount(classictestID)).toNumber().should.be.eq(0)
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
