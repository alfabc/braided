#!/usr/bin/env node
const contract = require('truffle-contract')
const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')

const config = require('../braided-config.js')

const braidedArtifacts = require('../build/contracts/BraidedInterface.json')

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

      // Check to make sure this exact same strand doesn't already exist
      // This allows us to use this setup procedure to add new strands to
      // existing contracts.
      // Use try/catch because while geth returns "null" values,
      // Parity throws an exception
      let strandExists = false
      try {
        if ((config.braids[key].contractAddress === await braid.getStrandContract(watch.strand)) &&
          (config.braids[key].genesisBlockHash === await braid.getStrandGenesisBlockHash(watch.strand)) &&
          (config.braids[key].chain === await braid.getStrandDescription(watch.strand))) {
          throw new Error()
        }
      } catch (err) {
        strandExists = true
        console.log(`... skipping: strand already exists on ${agent.braid} for ${key}`)
      }

      // if it doesn't already exist, add it
      if (!strandExists) {
        try {
          // add a strand for the chain
          let tx = await braid.addStrand(watch.strand,
            config.braids[key].contractAddress,
            config.braids[key].genesisBlockHash,
            config.braids[key].chain,
            { from: config.braids[agent.braid].ownerAddress })
          console.log(tx)
        } catch (err) {
          console.log("Failed to addStrand:  " + watch.strand + config.braids[key])
          console.log(err)
        }

        try {
          // give the agent permission to write to the strand
          tx = await braid.addAgent(
            agent.agentAddress,
            watch.strand,
            { from: config.braids[agent.braid].ownerAddress })
          console.log(tx)
        } catch (err) {
          console.log("Failed to addAgent:  " + watch.strand + agent.agentAddress)
          console.log(err)
        }
      }
    }
    await provider.engine.stop()
  }
}

setup()
