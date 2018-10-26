#!/usr/bin/env node
const contract = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/Braided.json')

async function setup () {
  // iterate over the agents that need to be set up
  for (let agent of config.agents) {
    // make a web3 connection to the chain that holds the braid
    let provider = new HDWalletProvider(
      config.braids[agent.braid].ownerMnemonic,
      config.braids[agent.braid].providerEndpoint)
    let web3 = new Web3(provider)
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
      let tx = await braid.addStrand(watch.strand,
        config.braids[key].contractAddress,
        config.braids[key].genesisBlockHash,
        config.braids[key].chain,
        { from: config.braids[agent.braid].ownerAddress })
      console.log(tx)
      // give the agent permission to write to the strand
      let tx2 = await braid.addAgent(
        agent.agentAddress,
        watch.strand,
        { from: config.braids[agent.braid].ownerAddress })
      console.log(tx2)
    }
    await provider.engine.stop()
  }
}

setup()
