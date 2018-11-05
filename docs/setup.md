These are the instructions for setting up your own braid of chains, starting with
no existing contracts.
1) Update `braided-config.js` with chains and agents to be used
2) create `.env` file in root directory of project with mnemonics for each owner and agent, as well as Infura endpoints
3) Create contracts on all chains using migrations.
`npm run migrate-mainnet`
`npm run migrate-ropsten`
`npm run migrate-rinkeby`
`npm run migrate-kovan`
4) Update `braided-config.js` with the `contractAddress` of each braid deployed in the previous step 
5) Set up each braid as a strand in every other braid by running `bin/setup.js`. This will call `addStrand` and `addAgent` as appropriate.
6) run `bin/agent.js` to launch clients and begin recording block/hashes
