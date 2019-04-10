#!/usr/bin/env node
const contract = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/Braided.json')

const blockLimit = 100

let braids = {}
let braidBlockHashes = {}
let chainBlockHashes = {}
let providers = {}
let web3s = {}

// read all existing data from known braids on existing chains
async function readFromChains () {
  // set up agents and contracts
  for (let braidKey in config.braids) {
    // make a web3 connection to the chain that holds the braid
    providers[braidKey] = new HDWalletProvider(
      config.braids[braidKey].ownerMnemonic,
      config.braids[braidKey].providerEndpoint)
    web3s[braidKey] = new Web3(providers[braidKey])
    let braidedContract = contract(braidedArtifacts)
    braidedContract.setProvider(web3s[braidKey].currentProvider)
    braidedContract.defaults({ gas: '250000' })
    braids[braidKey] = braidedContract.at(config.braids[braidKey].contractAddress)
  }

  // get last n blocks for each chain
  for (let braidKey in config.braids) {
    // get raw blocks from the chain on which the braid is recorded
    let headBlock = await web3s[braidKey].eth.getBlock('latest')
    chainBlockHashes[braidKey] = {}
    let blockNumber = headBlock.number
    while (blockNumber > headBlock.number - blockLimit) {
      blockNumber -= 1
      let block = await web3s[braidKey].eth.getBlock(blockNumber)
      chainBlockHashes[braidKey][blockNumber] = { number: block.number, hash: block.hash, matches: {}, score: 0 }
    }
  }
  console.log(chainBlockHashes)

  // get Braided block/hashes for each braid
  for (let agent of config.agents) {
    braidBlockHashes[agent.braid] = {}
    for (let key in agent.watches) {
      let watch = agent.watches[key]
      braidBlockHashes[agent.braid][key] = {}
      // get the highest recorded block/hash on the braid
      let blockNumber = await braids[agent.braid].getHighestBlockNumber(watch.strand)
      let blockHash = await braids[agent.braid].getBlockHash(watch.strand, blockNumber)
      for (let blockCount = 1; blockCount < blockLimit; blockCount += 1) {
        // get the block number (and its hash) for the block on that braid which
        // contains that block/hash
        let txnEvent = braids[agent.braid].BlockAdded({ blockNumber: blockNumber, strandID: watch.strand },
          { fromBlock: config.braids[agent.braid].creationBlock, toBlock: 'latest' })
        let txnResult = await Promisify(cb => txnEvent.get(cb))

        braidBlockHashes[agent.braid][key][blockNumber] = {
          blockNumber: blockNumber,
          blockHash: blockHash,
          includedIn: {
            strandID: watch.strand,
            blockNumber: txnResult[0].blockNumber,
            blockHash: txnResult[0].blockHash,
            transactionHash: txnResult[0].transactionHash
          }
        }

        // move on to the next block/hash on the braid; if no more, stop
        try {
          let result = await braids[agent.braid].getPreviousBlock(watch.strand, blockNumber)
          blockNumber = result[0].toNumber()
          blockHash = result[1]
        } catch {
          break
        }
      }
    }
  }

  // get matching Braided block/hashes from other braids for each braid
  // and the block/hash for the block in the braid in which they were recorded
  for (let braidKey in config.braids) {
    for (let agent of config.agents) {
      // skip the braid in question, we're interested in *other* braids
      if (agent.braid === braidKey) {
        continue
      }
    }
  }

  // shut down the providers for a clean exit
  for (let key in providers) {
    await providers[key].engine.stop()
  }

  console.log(JSON.stringify(braidBlockHashes))
}

readFromChains()

// Handle function that doesn't return a JS promise
const Promisify = (inner) =>
  new Promise((resolve, reject) =>
    inner((err, res) => {
      if (err) {
        reject(err)
      } else {
        resolve(res)
      }
    })
  )
