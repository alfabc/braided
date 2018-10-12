#!/usr/bin/env node
const childprocess = require('child_process')
const contract = require('truffle-contract')
const death = require('death')
const reqCwd = require('req-cwd')
const treeKill = require('tree-kill')
const Web3 = require('web3')

const config = reqCwd.silent('./.braided.js') || {}

let clients = {}
let contracts = {}
let web3s = {}

death((signal, err) => cleanUp())

// launch an agent for each listed in the config
launchClients()

// for each agent, add the appropriate watchers for each chain
// according to the config
for (let agent of config.agents) {
  console.log(agent)
  console.log(agent.chain)
  console.log(clients[agent.chain])
}

// launch a client for each chain listed in the config;
// each includes a Geth/Parity config
function launchClients () {
  return new Promise((resolve, reject) => {
    for (let chain of config.chains) {
      let params = ''
      let port = 30700 + chain.networkID
      let rpcport = 3370 + chain.networkID
      if (chain.client === 'geth') {
        params = `--port ${port} --rpc --rpcaddr "0.0.0.0" --rpcport ${rpcport} --rpcapi "web3,eth,net,debug" --rpccorsdomain "*" --syncmode "light" --${chain.clientChainName}` // eslint-disable-line max-len
      } else if (chain.client === 'parity') {
        params = `--light --port=${port} --jsonrpc-port=${rpcport} --chain=${chain.id}`
      } else {
        console.log(`Configuration error: Unsupported client '${chain.client}'`)
        return (1)
      }
      let proc = childprocess.exec(`${chain.client} ${params}`, (error, stdout, stderr) => {
        if (error);
      })
      console.log(`Spawned ${chain.client} pid ${proc.pid} for ${chain.id}`)
      clients[chain.id] = proc

      // create a Web3 instance for each client
      web3s[chain.id] = new Web3(new Web3.providers.HttpProvider("http://localhost:" + rpcport))
    }
  })
}

function cleanUp () {
  for (let key in clients) {
    let pid = clients[key].pid
    treeKill(pid, function () {
      console.log(`shutting down pid ${pid} for ${key}`)
    })
  }
}
