#!/usr/bin/env node
const contract = require('truffle-contract')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/Braided.json')

let clients = {}
let contracts = {}

// iterate over the agents that need to be set up
for (let agent of config.agents) {
  // Each agent operates on a braid
  console.log(agent.braid)
  // the agent's address
  console.log(agent.agentAddress)
  // Each braid has a contract address
  console.log(config.braids[agent.braid].contractAddress)
  // and we'll need the owner's mnemonic
  console.log(config.braids[agent.braid].ownerMnemonic)
  // Iterate over the chains watched for each agent
  for (let key in agent.watches) {
    // The chain watched
    console.log(key)
    let watch = agent.watches[key]
    // add a strand for the chain
    // thisBraid.addStrand(watch.strand,
    //   config.braids[agent.braid].contractAddress,
    //   config.braids[agent.braid].genesisBlockHash,
    //   config.braids[agent.braid].chain)
    console.log(`thisBraid.addStrand(${watch.strand},
    ${config.braids[agent.braid].contractAddress},
    ${config.braids[agent.braid].genesisBlockHash},
    ${config.braids[agent.braid].chain})`)
    // give the agent permission to write to the strand
    // thisBraid.addAgent(agent.address, watch.strand)
    console.log(`thisBraid.addAgent(${agent.address}, ${watch.strand})`)
  }
}
