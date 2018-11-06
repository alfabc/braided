#!/usr/bin/env node
const contract = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/Braided.json')

let blockHashes = {}
let matches = {}
let clashes = {}

// read all existing data from known braids on existing chains
async function readFromChains () {
  // iterate over the agents that need to be set up
  for (let braidKey in config.braids) {
    // make a web3 connection to the chain that holds the braid
    let provider = new HDWalletProvider(
      config.braids[braidKey].ownerMnemonic,
      config.braids[braidKey].providerEndpoint)
    let web3 = new Web3(provider)
    let braidedContract = contract(braidedArtifacts)
    braidedContract.setProvider(web3.currentProvider)
    braidedContract.defaults({ gas: '250000' })
    let braid = braidedContract.at(config.braids[braidKey].contractAddress)

    blockHashes[braidKey] = {}

    // Iterate over the chains watched for each agent
    for (let agent of config.agents) {
      if (agent.braid !== braidKey) {
        continue
      }

      for (let key in agent.watches) {
        let watch = agent.watches[key]
        // The chain watched
        console.log(`reading ${braidKey}.${key} is strand ${watch.strand}`)
        blockHashes[braidKey][watch.strand] = {}

        try {
          let blockNumber = await braid.getHighestBlockNumber(watch.strand)
          let blockHash = await braid.getBlockHash(watch.strand, blockNumber)
          while (blockNumber !== 0) {
            console.log(`${braidKey}.${key}(${watch.strand}) ${blockNumber} ${blockHash}`)
            // store in the array
            blockHashes[braidKey][watch.strand][blockNumber] = blockHash
            // get the next one: if the call fails, we're done.
            let result = await braid.getPreviousBlock(watch.strand, blockNumber)
            blockNumber = result[0].toNumber()
            blockHash = result[1]
          }
        } catch (err) {
          continue
        }
      }
    }
    await provider.engine.stop()
  }

  for (let braidKey in blockHashes) {
    console.log(braidKey)
    for (let strand in blockHashes[braidKey]) {
      console.log(strand)
      for (let blockNumber in blockHashes[braidKey][strand]) {
        for (let braidKey2 in blockHashes) {
          // skip comparison with our own braid
          if (braidKey2 === braidKey) continue
          // skip braid that doesn't record this strand
          if (!(strand in blockHashes[braidKey2])) continue
          // if the block appears in this braid/strand...
          if (blockNumber in blockHashes[braidKey2][strand]) {
            // if it matches
            if (blockHashes[braidKey][strand][blockNumber] === blockHashes[braidKey2][strand][blockNumber]) {
              addMatch(strand, braidKey, braidKey2, blockNumber)
            } else {
              // if it doesn't match
              addClash(strand, braidKey, braidKey2, blockNumber)
            }
          }
        }
      }
    }
  }
  console.log('Matches:')
  console.log(matches)
  console.log('Clashes:')
  console.log(clashes)
}

function addMatch (strand, braidKey, braidKey2, blockNumber) {
  addIncident(matches, strand, braidKey, braidKey2, blockNumber)
}

function addClash (strand, braidKey, braidKey2, blockNumber) {
  addIncident(clashes, strand, braidKey, braidKey2, blockNumber)
}

function addIncident (incidentType, strand, braidKey, braidKey2, blockNumber) {
  if (!(strand in incidentType)) {
    incidentType[strand] = {}
  }
  if (!(blockNumber in incidentType[strand])) {
    incidentType[strand][blockNumber] = {}
  }
  incidentType[strand][blockNumber][braidKey] = true
  incidentType[strand][blockNumber][braidKey2] = true
}

readFromChains()
