#!/usr/bin/env node
const braidedArtifacts = require('../build/contracts/Braided.json')
const childprocess = require('child_process')
const config = require('../braided-config.js')
const contract = require('truffle-contract')
const death = require('death')
const fs = require('fs')
const treeKill = require('tree-kill')
const Web3 = require('web3')

let clients = {}
let contracts = {}
let lastBlockNumbers = {}
let locks = {}
let braids = {}
let web3s = {}

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
      web3s[key] = new Web3(endpoint)

      // add a watcher for new blocks
      // pass in the key so we know which chain it comes from
      // console.log(web3s[key])
      // console.log(web3s[key].providers)
      web3s[key].eth.subscribe('newBlockHeaders')
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

    // create contract and instance for each contract on each chain
    for (let key in config.braids) {
      let braid = config.braids[key]
      contracts[key] = contract(braidedArtifacts)
      contracts[key].setProvider(web3s[braid.chain].currentProvider)
      contracts[key].defaults({ gas: '250000' })
      braids[key] = contracts[key].at(braid.contractAddress)
    }
  })
}

async function handleNewBlock (chainKey, blockHeader) {
  // local mutex for each chain to prevent working on two blocks at once
  if (locks[chainKey]) {
    console.log(`handleNewBlock: busy ${chainKey} ${blockHeader.number}`)
    return
  } else {
    locks[chainKey] = true
  }

  try {
    // quickly skip stale blocks
    if (lastBlockNumbers[chainKey] >= blockHeader.number) {
      console.log(`handleNewBlock: skipping ${chainKey} ${blockHeader.number}`)
      return
    }

    // sometimes a bunch of these come in at once, especially when a chain is
    // catching up, so work with the current highest block number on the chain.
    let block = await web3s[chainKey].eth.getBlock('latest')
    if (block.number > blockHeader.number) {
      console.log(`handleNewBlock: handling ${chainKey} ${block.number} instead of ${blockHeader.number}`)
    } else {
      console.log(`handleNewBlock: handling ${chainKey} ${block.number}`)
    }

    lastBlockNumbers[chainKey] = block.number

    // Walk through the agents
    for (let agent of config.agents) {
      // for each one who is watching the chain
      let chainParams = agent.watches[chainKey]
      if (chainParams) {
        console.log(`handleNewblock: considering ${chainKey} ${block.number} for ${agent.braid} ${chainParams.blocks} ${chainParams.seconds}`) // eslint-disable-line max-len
        // -- -- check the time update threshold
        // -- -- if not met, skip

        // -- -- check the block number last recorded on the braid for the strand
        // -- -- if already recorded, skip

        // -- -- check the block number update threshold
        // -- -- if the block does not meet the update threshold, skip

        // -- -- record the block on the braid for the strand
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
  for (let key in web3s) {
    web3s[key].currentProvider.connection.close()
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
