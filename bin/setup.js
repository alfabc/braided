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
      let strandExists = true
      try {
        let strandContract = await braid.getStrandContract(watch.strand)
        let strandGenesisBlockHash = await braid.getStrandGenesisBlockHash(watch.strand)
        let strandDescription = await braid.getStrandDescription(watch.strand)
        console.log(`considering ${agent.braid}.${key}`)
        // console.log(`  contract ${config.braids[key].contractAddress} existing ${strandContract}`)
        // console.log(`  genesis ${config.braids[key].genesisBlockHash} existing ${strandGenesisBlockHash}`)
        // console.log(`  description ${config.braids[key].chain} existing ${strandDescription}`)

        // sometimes there may be an EIP-55 compliant contract address
        strandExists = ((config.braids[key].contractAddress.toUpperCase() === strandContract.toUpperCase()) &&
          (config.braids[key].genesisBlockHash === strandGenesisBlockHash) &&
          (config.braids[key].chain === strandDescription))
      // Parity throws an exception when the result is null, so assume not existing
      } catch (err) {
        strandExists = false
      }

      // if it doesn't already exist, add it
      if (strandExists) {
        console.log(`... skipping: exact same strand already exists on ${agent.braid} for ${key}`)
      } else {
        try {
          // add a strand for the chain
          let tx = await braid.addStrand(watch.strand,
            config.braids[key].contractAddress,
            config.braids[key].genesisBlockHash,
            config.braids[key].chain,
            { from: config.braids[agent.braid].ownerAddress })
          console.log(tx)
        } catch (err) {
          console.log(`Failed to addStrand: ${agent.braid}.${key} ${watch.strand}`)
          console.log(err)
        }

        try {
          // give the agent permission to write to the strand
          let tx = await braid.addAgent(
            agent.agentAddress,
            watch.strand,
            { from: config.braids[agent.braid].ownerAddress })
          console.log(tx)
        } catch (err) {
          console.log(`Failed to addAgent: ${agent.braid} ${watch.strand} ${agent.agentAddress}`)
          console.log(err)
        }
      }
    }
    await provider.engine.stop()
  }
}

setup()
