#!/usr/bin/env node
const contract = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/Braided.json')

setup()

function setup () {
  return new Promise(async () => {
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
      // make a web3 connection to the chain that holds the braid
      let web3 = new Web3(
        new HDWalletProvider(config.braids[agent.braid].ownerMnemonic,
         config.braids[agent.braid].providerEndpoint))
      let braidedContract = contract(braidedArtifacts)
      braidedContract.setProvider(web3.currentProvider)
      braidedContract.defaults({ gas: '250000' })
      let braid = braidedContract.at(config.braids[agent.braid].contractAddress)

      // Iterate over the chains watched for each agent
      for (let key in agent.watches) {
        // The chain watched
        console.log(`adding ${key} to ${agent.braid}`)
        let watch = agent.watches[key]
        // add a strand for the chain
        console.log(`addStrand(${watch.strand}, ${config.braids[key].contractAddress}, ${config.braids[key].genesisBlockHash}, ${config.braids[key].chain})`)
//        await braid.addStrand(watch.strand,
//          config.braids[key].contractAddress,
//          config.braids[key].genesisBlockHash,
//          config.braids[key].chain)
        // give the agent permission to write to the strand
        console.log(`addAgent(${agent.agentAddress}, ${watch.strand})`)
//        await braid.addAgent(agent.agentAddress, watch.strand)
      }
    }
  })
}
