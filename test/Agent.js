// Tests the agent which reads blocks, records block/hashes,
// reads block/hashes, issues alerts, and writes confirmations.

// To make this testable, the Agent contains callback functions
// which are used to subscribe to Web3 notifications for new
// blocks and for `Braided.addBlock()`

// So, for a given agent, we can test it by creating an object
// and throwing a bunch of alerts at it. We don't have to mock
// the Web3 calls.

// However, if we wanted to check the block/hashes against real
// blocks and hashes on the *watched* chains as well, then
// we'd need to mock the Web3 calls for those chains.
//
/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const Braided = artifacts.require('../contracts/Braided.sol')
const config = require('../braided-config.js')
const expectThrow = require('./helpers/expectThrow.js')
const fs = require('fs')
const md5 = require('md5')
const parse = require('csv-parse/lib/sync')
const util = require('util')

const readFile = util.promisify(fs.readFile)
const strandCount = 4
const fixtureLines = 30
let fixtures = []

// For the purposes of this test we're pretending these contracts
// are deployed on four different strands
let contracts = []

const mainnetGenesis = config.braids.mainnet.genesisBlockHash
const mordenGenesis = config.braids.morden.genesisBlockHash
const ropstenGenesis = config.braids.ropsten.genesisBlockHash
const kovanGenesis = config.braids.kovan.genesisBlockHash

// test data was created in Google Sheets and used the venerable MD5 hash.
function fakeHash (value) {
  let hash = md5(String(value))
  return '0x' + hash + hash
}

contract('Braided', (accounts) => {
  let superuser = accounts[0]

  context('loading test data', () => {
    it('should load the test data', async () => {
      for (let s = 0; s < strandCount; s++) {
        fixtures.push(parse(await readFile('./test/data/net' + (s + 1) + '.csv')))
      }
      fixtures.length.should.be.eq(strandCount)
    })

    it('should instantiate a Braided contract for each strand', async () => {
      // create contracts (as if they were on different strands)
      for (let s = 0; s < strandCount; s++) {
        contracts.push(await Braided.new())
      }

      // add strands, and permissions for agents to add blocks to those strands
      for (let s = 0; s < strandCount; s++) {
        if (s !== 0) {
          await contracts[s].addStrand(1, contracts[0].address, mainnetGenesis,
            'Foundation', { from: superuser })
          await contracts[s].addAgent(accounts[s + 1], 1, { from: superuser })
        }
        if (s !== 1) {
          await contracts[s].addStrand(2, contracts[1].address, mordenGenesis, 'morden', { from: superuser })
          await contracts[s].addAgent(accounts[s + 1], 2, { from: superuser })
        }
        if (s !== 2) {
          await contracts[s].addStrand(3, contracts[2].address, ropstenGenesis, 'Ropsten', { from: superuser })
          await contracts[s].addAgent(accounts[s + 1], 3, { from: superuser })
        }
        if (s !== 3) {
          await contracts[s].addStrand(4, contracts[3].address, kovanGenesis, 'Kovan', { from: superuser })
          await contracts[s].addAgent(accounts[s + 1], 4, { from: superuser })
        }

        // each strand should have all but itself
        (await contracts[s].getStrandCount()).toNumber().should.be.eq(strandCount - 1)
      }

      contracts.length.should.be.eq(strandCount)
    })

    it('should write the test data', async () => {
      // For each line in the sample data
      // skip the header line
      for (let l = 1; l < fixtureLines; l++) {
        // process the line for each strand
        for (let s = 0; s < strandCount; s++) {
          // skip new blocks and empty lines
          if (fixtures[s][l][0] === '' && fixtures[s][l][2] !== '') {
            let strand = parseInt(fixtures[s][l][2].charAt(4))
            let block = parseInt(fixtures[s][l][3])
            let hash = '0x' + fixtures[s][l][4]
            await contracts[s].addBlock(strand, block, hash, { from: accounts[s + 1] })
          }
        }
      }
    })

    it('should fail to re-add previous blocks', async () => {
      await expectThrow(contracts[0].addBlock(2, 15122,
        '0x12616f69e1fed7eabfd7b87bf2bdccb012616f69e1fed7eabfd7b87bf2bdccb0',
        { from: accounts[1] }))
    })

    it('should have correct highest block numbers', async () => {
      // strand 0 does not have itself
      await expectThrow(contracts[0].getHighestBlockNumber(1));
      (await contracts[1].getHighestBlockNumber(1)).toNumber().should.be.eq(23155);
      (await contracts[2].getHighestBlockNumber(1)).toNumber().should.be.eq(23151);
      (await contracts[3].getHighestBlockNumber(1)).toNumber().should.be.eq(23156)
    })

    it('should have matchy block hashes', async () => {
      (await contracts[1].getBlockHash(1, 23151)).should.be.eq(
        await contracts[2].getBlockHash(1, 23151));
      (await contracts[2].getBlockHash(1, 23151)).should.be.eq(
        await contracts[3].getBlockHash(1, 23151));
      (await contracts[1].getBlockHash(1, 23154)).should.be.eq(
        await contracts[3].getBlockHash(1, 23154));
      (await contracts[1].getBlockHash(1, 23155)).should.be.eq(
        await contracts[3].getBlockHash(1, 23155));
      (await contracts[0].getBlockHash(2, 15126)).should.be.eq(
        await contracts[2].getBlockHash(2, 15126));
      (await contracts[0].getBlockHash(3, 8847)).should.be.eq(
        await contracts[1].getBlockHash(3, 8847));
      (await contracts[0].getBlockHash(4, 28244)).should.be.eq(
        await contracts[2].getBlockHash(4, 28244))
    })

    it('should not return hashes for unrecorded blocks', async () => {
      await expectThrow(contracts[0].getBlockHash(2, 15128))
      await expectThrow(contracts[1].getBlockHash(1, 23153))
      await expectThrow(contracts[2].getBlockHash(1, 23153))
      await expectThrow(contracts[3].getBlockHash(1, 23157))
    })

    // The intention here is to avoid even the appearance of retconning;
    // block numbers only go up.
    it('should not allow previous blocks to be inserted', async () => {
      (await contracts[0].getHighestBlockNumber(3)).toNumber().should.be.gt(8845)
      // sanity test on our fakeHash function
      fakeHash(8845).should.eq('0xff82db7535530637af7f8a96284b3459ff82db7535530637af7f8a96284b3459')
      await expectThrow(contracts[0].addBlock(3, 8845, fakeHash(8845), { from: accounts[1] }))
    })

    it('should allow additional valid blocks', async () => {
      await contracts[0].addBlock(2, 15128, fakeHash(15128), { from: accounts[1] })
      await contracts[0].addBlock(3, 8853, fakeHash(8853), { from: accounts[1] })
      await contracts[0].addBlock(4, 28250, fakeHash(28250), { from: accounts[1] })
      await contracts[1].addBlock(1, 23156, fakeHash(23156), { from: accounts[2] })
      await contracts[1].addBlock(3, 8852, fakeHash(8852), { from: accounts[2] })
      await contracts[1].addBlock(4, 28249, fakeHash(28249), { from: accounts[2] })
      await contracts[2].addBlock(1, 23152, fakeHash(23152), { from: accounts[3] })
      await contracts[2].addBlock(2, 15127, fakeHash(15127), { from: accounts[3] })
      await contracts[2].addBlock(4, 28245, fakeHash(28245), { from: accounts[3] })
      await contracts[3].addBlock(1, 23157, fakeHash(23157), { from: accounts[4] })
      await contracts[3].addBlock(2, 15122, fakeHash(15122), { from: accounts[4] })
      await contracts[3].addBlock(3, 8844, fakeHash(8844), { from: accounts[4] })
    })
  })
})

// Given an agent AgentA
// And a recording chain Chain1
// And a watched chain Chain2
// And a watched chain Chain3
// And a watched chain Chain4

// Test the recording of new blocks from a watched chain
// Chain1 should subscribe to block notifications for Chain2-3-4
// When the watched Chain2-4 produces a new block 101
//   ... And its block number is higher than the current highest block number on the recording chain Chain1 (100)
//     Then the block/hash should be added to Chain1

//   ...  And the block number is less than the current highest block number
//     the Agent for Chain2-4 might just be behind
//   Then AgentA should log an EVENT
//   //  perhaps start a counter? issue an alert after X occurrances?

// Recording chain should watch out for itself
// Chain1 should subscribe to addBlock events for Chain1 from Chain2-4
// When the watched chain adds a new block/hash
//   ... and the block number exists in the local chain

// The recording node might be behind. If it stays that way...
//   ... and the block number does not exist in the local chain
//   Then AgentA should log an EVENT
//    // perhaps start a counter? issue an alert after X occurrances?

//    ... and the block number exists in the local chain

//    ... and the watched block/hash == hash of the block on Chain1
//       // should AgentA record confirmation of its own block?
//       // is this necessary or desirable?

//    ... and the watched block/hash != hash of the block on Chain1
//       // Fork detection / consensus failure
//    Then AgentA should log an ALERT

// record block/hash confirmations from the watched chains
// Chain1 subscribes to addBlock events for ChainX(2-4) from ChainY(2-4)
// When a watched chain adds a new block/hash
//   ... and ChainX.ChainY block number >= Chain1.getHighestBlockNumber(ChainY)
//   ... and the new block/hash is not already recorded in the Braided contract on Chain1
//     Then the block/hash should be added to Chain1

//   ... and the block number is

// When the watched chain produces a new block
// And the new block is already recorded in the Braided contract on the recording chain
// If the block hash matches the block hash recorded in the Braided contract
// Then nothing happens
// Else
// an error is reported (MECHANISM?)

// When the watched chain produces a new block
// And a higher block number already exists
