#!/usr/bin/env node
const braidedArtifacts = require('../build/contracts/Braided.json')
const childprocess = require('child_process')
const config = require('../braided-config.js')
const contract = require('truffle-contract')
const death = require('death')
const fs = require('fs')
const HDWalletProvider = require('truffle-hdwallet-provider')
const treeKill = require('tree-kill')
const Web3 = require('web3')

let agentProviders = {}
let braids = {}
let braidedContracts = {}
let clients = {}
let lastBlockNumbers = {}
let lastBlockRecordedTime = {}
let locks = {}
let web3rs = {} // readers
let web3ws = {} // writers

death((signal, err) => cleanUp())

// launch an agent for each listed in the config
launch()

// launch a client for each chain listed in the config;
// each includes a Geth/Parity config
function launch () {
  return new Promise((resolve, reject) => {
    for (let key in config.chains) {
      let chain = config.chains[key]
      let endpoint

      // Existing running clients or remote services...
      if (chain.client === 'websocket') {
        endpoint = chain.endpoint
      } else {
        // Other clients are launched
        let params = ''
        let port = 30303 + chain.networkID
        let rpcport = 3370 + chain.networkID
        let wsport = 8546 + chain.networkID
        endpoint = 'ws://localhost:' + wsport

        if (chain.client === 'geth') {
          params = `--port ${port} --rpc --rpcaddr "0.0.0.0" --rpcport ${rpcport} --rpcapi "web3,eth,net,debug" --rpccorsdomain "*" --ws --wsport ${wsport} --wsaddr 0.0.0.0 --wsorigins "*" --syncmode "${chain.mode}" --${chain.chainName}` // eslint-disable-line max-len
        } else if (chain.client === 'parity') {
          params = `--${chain.mode} --port=${port} --jsonrpc-port=${rpcport} --ws-port=${wsport} --chain=${chain.chainName}` // eslint-disable-line max-len
        } else {
          console.log(`Configuration error: Unsupported client '${chain.client}'`)
          return (1)
        }
        let proc = childprocess.exec(`${chain.client} ${params}`, (error, stdout, stderr) => {
          if (error);
        })
        proc.stderr.pipe(fs.createWriteStream(`/tmp/${chain.client}-${key}-err.log`))
        proc.stdout.pipe(fs.createWriteStream(`/tmp/${chain.client}-${key}-out.log`))
        console.log(`Spawned ${chain.client} pid ${proc.pid} for ${key}`)
        clients[key] = proc

        sleep(15)
      }

      // create a Web3 instance for each client
      web3rs[key] = new Web3(endpoint)

      // add a watcher for new blocks
      // pass in the key so we know which chain it comes from
      web3rs[key].eth.subscribe('newBlockHeaders')
        .on('data', function (blockHeader) {
          handleNewBlock(key, blockHeader)
        })
        .on('error', function (error) {
          console.error(`${key} subscription error: ${error}`)
        })

      // caches the last seen block
      lastBlockNumbers[key] = 0
      // mutex
      locks[key] = false
    }
  })
}

async function handleNewBlock (chainKey, blockHeader) {
  // local mutex for each chain to prevent working on two blocks at once
  if (locks[chainKey]) {
    console.log(`busy ${chainKey} ${blockHeader.number}`)
    return
  } else {
    locks[chainKey] = true
  }

  try {
    // quickly skip stale blocks
    if (lastBlockNumbers[chainKey] >= blockHeader.number) {
      console.log(`skipping ${chainKey} ${blockHeader.number}`)
      return
    }

    // sometimes a bunch of these come in at once, especially when a chain is
    // catching up, so work with the current highest block number on the chain.
    let block = await web3rs[chainKey].eth.getBlock('latest')
    if (block.number > blockHeader.number) {
      console.log(`handling ${chainKey} ${block.number} instead of ${blockHeader.number}`)
    } else {
      console.log(`handling ${chainKey} ${block.number}`)
    }

    lastBlockNumbers[chainKey] = block.number

    // Walk through the agents
    for (let agent of config.agents) {
      // for each one who is watching the chain
      let chainParams = agent.watches[chainKey]
      if (chainParams) {
        console.log(`considering ${chainKey} ${block.number} for ${agent.braid} ${chainParams.blocks} ${chainParams.seconds}`) // eslint-disable-line max-len

        // use the contract on the chain from which we received the notification
        let braidedContract = contract(braidedArtifacts)
        braidedContract.setProvider(web3rs[chainKey].currentProvider)
        let braid = braidedContract.at(config.braids[agent.braid].contractAddress)

        // We identify the braid/chain combo thus
        let combo = `${agent.braid}.${chainKey}`

        // check the time update threshold
        if (lastBlockRecordedTime[combo]) {
          let tick = lastBlockRecordedTime[combo] + (chainParams.seconds * 1000) 
          if (tick > Date.now()) {
            let delay = Math.round((tick - Date.now()) / 1000)
            console.log(`${block.number} skipped, waiting ${delay} seconds on ${combo}`)
            // too soon!
            continue
          }
        }

        // check the block number last recorded on the braid for the strand
        let hBN = 0
        // when there are no blocks recorded this can throw
        try {
          hBN = await braid.getHighestBlockNumber(chainParams.strand)
        } catch { }

        // if already recorded, skip this agent
        if (hBN >= block.number) {
          console.log(`${block.number} skipped, ${hBN} already recorded`)
          continue
        }

        // check the block number update threshold
        // if the block does not meet the update threshold, skip
        if (hBN + chainParams.blocks >= block.number) {
          console.log(`${block.number} skipped, waiting ${chainParams.blocks} blocks after ${hBN}`)
          continue
        }

        // set up a web3 instance for the provider with the keys for the agent
        // and cache it for next time
        if (!web3ws[agent.braid]) {
          agentProviders[agent.braid] = new HDWalletProvider(
            agent.agentMnemonic,
            config.braids[agent.braid].providerEndpoint)
          web3ws[agent.braid] = new Web3(agentProviders[agent.braid])
          braidedContracts[agent.braid] = contract(braidedArtifacts)
          braidedContracts[agent.braid].setProvider(web3ws[agent.braid].currentProvider)
          braidedContracts[agent.braid].defaults({ gas: '250000' })
          braids[agent.braid] = braidedContracts[agent.braid].at(config.braids[agent.braid].contractAddress)
        }

        // record the block on the braid for the strand
        try {
          // Note when we last *attempted* a transaction for this...
          lastBlockRecordedTime[combo] = Date.now()

          console.log(`sending ${block.number} on ${combo} at ${lastBlockRecordedTime[combo]}...`)
          // send the transaction
          let tx = await braids[agent.braid].addBlock(
            chainParams.strand,
            block.number,
            block.hash,
            { from: agent.agentAddress })
          console.log(`sent ${tx.tx} for ${block.number} on ${combo}`)
        } catch (err) {
          console.log(err)
        }
      }
    }
  } finally {
    // unlock chain
    locks[chainKey] = false
  }
}

function cleanUp () {
  // Close all websocket connections, or the connection to an external geth
  // will prevent this process from exiting.
  // https://ethereum.stackexchange.com/questions/50134/web3-websocket-connection-prevents-node-process-from-exiting
  for (let key in web3rs) {
    web3rs[key].currentProvider.connection.close()
  }

  // same for these HDWalletProviders
  for (let key in agentProviders) {
    agentProviders[key].engine.stop()
  }

  // kill clients we launched
  for (let key in clients) {
    let pid = clients[key].pid
    treeKill(pid, function () {
      console.log(`shutting down pid ${pid} for ${key}`)
    })
  }
}

function sleep (seconds) {
  process.stdout.write(`sleeping ${seconds} seconds...`)
  childprocess.execSync(`sleep ${seconds}`)
  console.log(' done.')
}
