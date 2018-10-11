#!/usr/bin/env node
const childprocess = require('child_process')
const death = require('death')
const reqCwd = require('req-cwd')
const treeKill = require('tree-kill')

const config = reqCwd.silent('./.braided.js') || {}

let clients = []

death((signal, err) => cleanUp())

console.log(config)

// launch an agent for each listed in the config
launchClients()

// for each agent, add the appropriate watchers for each chain
// according to the config
console.log("HERE!!!")

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
      let proc = childprocess.exec(`${chain.client} ${params}`, (err, stdout, stderr) => {})
      console.log(`Spawned ${chain.client} pid ${proc.pid} for ${chain.id}`)
      clients.push(proc)
    }
  })
}

function cleanUp () {
  for (let client of clients) {
    let pid = client.pid
    treeKill(pid, function () {
      console.log(`shutting down pid ${pid}`)
    })
  }
}
