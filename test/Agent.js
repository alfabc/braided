// Tests the agent which reads blocks, records block/hashes,
// reads block/hashes, issues alerts, and writes confirmations.

// To make this testable, the Agent contains callback functions
// which are used to subscribe to Web3 notifications for new
// blocks and for `Shackle.addBlock()`

// So, for a given agent, we can test it by creating an object
// and throwing a bunch of alerts at it. We don't have to mock
// the Web3 calls.

// However, if we want to check the block/hashes against real
// blocks and hashes on the *watched* chains as well, then
// we'll need to mock the Web3 calls for those chains.
//
/* eslint-env node, mocha */
/* eslint no-unused-expressions: 0 */
/* eslint prefer-const: 0 */
const parse = require('csv-parse/lib/sync')
const fs = require('fs')
const util = require('util')
const readFile = util.promisify(fs.readFile)
const ChainBlockHashes = artifacts.require('../contracts/ChainBlockHashes.sol')
const expectThrow = require('./helpers/expectThrow.js')
const md5 = require('md5')

const chainCount = 4
const fixtureLines = 30
let fixtures = []
// For the purposes of this test we're pretending these contracts
// are deployed on four different chains
let contracts = []

const mainnetGenesis = '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3'
const mordenGenesis = '0x0cd786a2425d16f152c658316c423e6ce1181e15c3295826d7c9904cba9ce303'
const ropstenGenesis = '0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d'
const kovanGenesis = '0xa3c565fc15c7478862d50ccd6561e3c06b24cc509bf388941c25ea985ce32cb9'

// test data was created in Google Sheets and used the venerable MD5 hash.
function fakeHash (value) {
  let hash = md5(String(value))
  return '0x' + hash + hash
}

contract('ChainBlockHashes', (accounts) => {
  let superuser = accounts[0]

  context('loading test data', () => {
    it('should load the test data', async () => {
      for (let c = 0; c < chainCount; c++) {
        fixtures.push(parse(await readFile('./test/data/net' + (c + 1) + '.csv')))
      }
      fixtures.length.should.be.eq(chainCount)
    })

    it('should instantiate a ChainBlockHashes contract for each chain', async () => {
      for (let c = 0; c < chainCount; c++) {
        contracts.push(await ChainBlockHashes.new())
        await contracts[c].addAgent(accounts[c + 1], { from: superuser })
        if (c !== 0) {
          await contracts[c].addChain(1, mainnetGenesis, 'Foundation', { from: superuser })
        }
        if (c !== 1) {
          await contracts[c].addChain(2, mordenGenesis, 'morden', { from: superuser })
        }
        if (c !== 2) {
          await contracts[c].addChain(3, ropstenGenesis, 'Ropsten', { from: superuser })
        }
        if (c !== 3) {
          await contracts[c].addChain(4, kovanGenesis, 'Kovan', { from: superuser })
        }

        // each chain should have all but itself
        (await contracts[c].getChainCount()).toNumber().should.be.eq(chainCount - 1)
      }
      contracts.length.should.be.eq(chainCount)
    })

    it('should write the test data', async () => {
      // For each line in the sample data
      // skip the header line
      for (let l = 1; l < fixtureLines; l++) {
        // process the line for each chain
        for (let c = 0; c < chainCount; c++) {
          // skip new blocks and empty lines
          if (fixtures[c][l][0] === '' && fixtures[c][l][2] !== '') {
            let chain = parseInt(fixtures[c][l][2].charAt(4))
            let block = parseInt(fixtures[c][l][3])
            let hash = '0x' + fixtures[c][l][4]
            await contracts[c].addBlock(chain, block, hash, { from: accounts[c + 1] })
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
      // chain 0 does not have itself
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
//   ... and the new block/hash is not already recorded in the Shackle contract on Chain1
//     Then the block/hash should be added to Chain1

//   ... and the block number is

// When the watched chain produces a new block
// And the new block is already recorded in the Shackle contract on the recording chain
// If the block hash matches the block hash recorded in the Shackle contract
// Then nothing happens
// Else
// an error is reported (MECHANISM?)

// When the watched chain produces a new block
// And a higher block number already exists
