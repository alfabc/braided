#!/usr/bin/env node
const childprocess = require('child_process')
const contract = require('truffle-contract')
const death = require('death')
const fs = require('fs')
const reqCwd = require('req-cwd')
const treeKill = require('tree-kill')
const Web3 = require('web3')

const config = reqCwd.silent('./.braided.js') || {}

const braidedArtifacts = require('../build/contracts/Braided.json')

let clients = {}
let contracts = {}
let strands = {}
let web3s = {}

death((signal, err) => cleanUp())

// launch an agent for each listed in the config
launch()

// for each agent, add the appropriate watchers for each chain
// according to the config
for (let agent of config.agents) {
  console.log(agent)
  console.log(agent.strand)
  // console.log(clients[agent.chain])
}

// launch a client for each chain listed in the config;
// each includes a Geth/Parity config
function launch () {
  return new Promise((resolve, reject) => {
    for (let key in config.chains) {
      let chain = config.chains[key]
      let wsport
      // Existing running clients are 'custom'
      if (chain.client === 'custom') {
        wsport = chain.wsport
      } else {
        // Other clients are launched
        let params = ''
        let port = 30303 + chain.networkID
        let rpcport = 3370 + chain.networkID
        wsport = 8546 + chain.networkID

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
      web3s[key] = new Web3('ws://localhost:' + wsport)

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
    }

    // create contract and instance for each contract on each strand
    for (let key in config.strands) {
      let strand = config.strands[key]
      contracts[key] = contract(braidedArtifacts)
      contracts[key].setProvider(web3s[strand.chain].currentProvider)
      contracts[key].defaults({ gas: '250000' })
      strands[key] = contracts[key].at(strand.contractAddress)
    }
  })
}

function handleNewBlock (chainKey, blockHeader) {
  console.log(`handleNewBlock: ${chainKey} ${blockHeader.number} ${blockHeader.hash}`)

  // sometimes a bunch of these come in at once, especially when a chain is
  // catching up, so work with the current highest block number on the chain.

  // block other threads from processing this chain

  // Walk through the agents

  // -- for each one who is watching the chain

  // -- -- check the block number last recorded on the strand

  // -- -- check the update thresholds

  // -- -- record the block on the strand

  // release thread block
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
