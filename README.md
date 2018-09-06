[![Build Status](https://travis-ci.org/alfabc/shackle.svg?branch=master)](https://travis-ci.org/alfabc/shackle)
[![Coverage Status](https://coveralls.io/repos/github/alfabc/shackle/badge.svg?branch=master)](https://coveralls.io/github/alfabc/shackle?branch=master)

# shackle 

## Overview
Shackle improves the censorship and forgery resistance of Ethereum blockchains by using smart contracts to share block hashes among multiple chains, thus helping to reduce the probability of [51% attacks](https://www.crypto51.app/about.html).  By tying together multiple, independently verified chains with different consensus algorithms and trust methods, this method would make it necessary for an attacker to simultaneously attack all chains, thus increasing the cost and reducing the likelihood of a successful attack.

This is achieved by the simple method of recording recent block numbers and block hashes for different blockchains, and doing this simultaneously on multiple chains at the same time.  When executed on multiple chains which have low (or no) economic value to their gas, this makes mutual verification of chains possible without spending ETH that is worth money.

## Why is this important?
[51% attacks are real](https://www.coindesk.com/blockchains-feared-51-attack-now-becoming-regular/), and [www.crypto51.app](https://www.crypto51.app/about.html) points out that "interchain linking" helps to combat this problem.

The Ethereum main network is worth [a lot of money](https://coinmarketcap.com/currencies/ethereum/), it has a great deal of hash power and attracts a lot of attention.  It has a lot of nodes, multiple software clients, and is therefore more resistant to censorship or inadvertent data loss.  But it still could be subject to a 51% attack and the consequences would be bad (and tiresome), and although [Proof of Stake](https://github.com/ethereum/casper) will help solve this problem (when it arrives) we certainly have an issue now.  It is also very expensive to store your data on the mainnet, as it is then stored on all nodes, forever.  Although [sharding](https://github.com/ethereum/wiki/wiki/Sharding-FAQs) and "layer 2" solutions are ([constantly](https://www.coindesk.com/not-ethereum-believers-scaling-just-matter-time/)) proposed, there is no guaranteed timeline for any of them. So: it's great, but it's expensive, and it could still be torpedoed.

One recommended scaling solution is to run your own blockchain, often using a Proof of Authority such as [Geth Clique](https://medium.com/@collin.cusce/using-puppeth-to-manually-create-an-ethereum-proof-of-authority-clique-network-on-aws-ae0d7c906cce) or [Parity Aura](https://wiki.parity.io/Pluggable-Consensus). But small blockchains have few nodes to provide redundancy and little or no censorship resistance, which reduces the trust that users can place in them.

But our "test" networks are also important.  Test networks are where developers *test*: they learn, debug problems, work on prototypes, and integrate multi-party services in a close-to-real-world environment. Testing code is good, but it is also important to have a place to test out *ideas* that sometimes don't yet have solid economic incentives worked out: that doesn't mean that these projects and their data are meaningless, or that they shouldn't be taken seriously.  New projects are usually deployed on a testnet first.  Early adopters should not lose their data just because wallets are still too hard for people (even developers) to use.  The continued support (and even [resuscitation](https://github.com/ethereum/ropsten/blob/master/revival.md)) of our test networks is extremely important, and maintaining their integrity is also important — and Proof of Stake can't help us when the ether for the platform has no real economic value.

Finally, chains fork, they [have forked](https://ethereumclassic.org/), and they will continue to fork as long as blockchains exist. We need a solution which works within the economic and practical constraints of the blockchains that already exist today.

## The solution
The solution is a smart contract deployed on multiple blockchains, with automated agents which watch for new blocks to be created on each chain, and then record that block number and its block hash (the "block/hash") for all chains in each chain.

### Limitations
In order to provide the necessary security on multiple blockchains **now**, without requiring forks, changes to [consensus algorithms](https://github.com/ethereum/casper), agreements between multiple parties with different interests, sale of utility tokens, or escrowed deposits, this solution is necessarily limited in multiple ways: it does not inherently scale to an infinite number of chains, nor does it allow for trust-free participation of recorders, nor does it automatically provide on-chain notification of the detection of irregularites.  Instead it is intended to provide observers with a convenient data source, useful tools for analysis and timely alerts when something happens.

### Roles
The contract is deployed on each blockchain, each with an owner who can license agents with the permission to record hashes.  The owner can issue and revoke that license; the agent cannot do anything but record hashes. The owner can also add new blockchains (but not delete chains or hashes).

## Failure modes
Failure nodes are where errors are reported, things stop working, or real attacks occur.

### Forks
Forks are not handled automatically and require manual intervention on the part of the contract owner, the agents, or both.

Each agent must upgrade its client node software as necessary for forks, both for the chains it watches and for the chain on which it records blocks.

For the chains the agent monitors, if the client software is *not* upgraded: In the case of a planned, non-contentious hard fork, new blocks will probably just fail to appear, and the agent will not submit them to the contract on which it is recording block/hashes.  
In the case of a contentious hard fork the agent will continue to follow the old chain, and the new chain will be ignored. At that point the new chain will probably be added by the contract owner as a new chain and be tracked.

For the chain on which the agent records block/hashes, if the client software is *not* updated:

In the case of a planned, non-contentious hard fork, attempts to record new block/hashes will fail, as they will be rejected by other nodes and ignored by miners.

In the case of a contentious hard fork the agent will continue to follow the old chain, recording the new block/hashes on the old chain. The agent (or another agent) will have to be configured to record on the new chain as well.

### Consensus failure
Consensus failures (aka unintentional forks) arise from different node software. We've seen about [one](https://blog.ethereum.org/2016/11/25/security-alert-11242016-consensus-bug-geth-v1-4-19-v1-5-2/) [per](https://github.com/ethereumproject/ECIPs/blob/master/ECIPs/ECIP-1039.md) [year](https://www.trustnodes.com/2018/06/06/parity-finds-consensus-bug-urges-upgrade-new-client), sometimes due to bugs, sometimes due to ambiguity in the specifications.  In this situation different agents using different node software to monitor the same networks may diverge on the forks.

Resolution is the same as for intentional forks.

### Out of gas
Each agent require requires gas to record new block/hashes on each chain. If the agent runs out of gas it will stop recording, and this will cause an error or alert.

This can be avoided by using [https://github.com/EtherAlerter](EtherAlerter) to notify the Alerter or Owner that the alerter needs more funds, and by automating the funding of gas through faucets or other mechanisms.  The alerter software itself may be adapted to do this automatically, but ultimately requires some human intervention as the contract has no mechanism for self-funding.

### Agent failure
All agents responsible for recording block/hashes on a given chain, or for given chains, will occasionally be disconnected from the network, power outage, maintanence or otherwise experience downtime.

## Recovery
Recovery from any failure mode consists of bringing the agent back online, bringing a new agent online, or adding a new chain to the contract on each recording chain.  New block/hashes will be recorded as blocks are created. Life goes on until the next alert.

## Lifecycle and governance
The contract is deployed on each blockchain by a **superuser** (which can be a regular account or a smart contract). The superuser can make another account (or contract) an **owner** (which is transferrable but revocable by the superuser). The superuser and owner give an **agent** account (or contract) permission to record block/hashes on that contract instance.

The contract is not upgradeable, cannot be destroyed, and its chain and block/hash data cannot be modified or deleted.  When new functionality is required a new instance will be deployed, and the old contract will be ignored (it can be programmatically abandoned by removing all agent permissions and setting the superuser and owner to a burn address).

Anyone may deploy their own instance of the contract.  If it is determined that a single contract instance is useful or desirable the superuser could be a DAO, particularly if deployed on a network for which transactions cost real-world money.

## Conclusion
Although this solution has substantial limitations, is somewhat naive and and in some ways inelegant, it is most importantly something that *gets the job done now*, and allows us as developers to secure the integrity of our main networks, test networks and our other Ethereum networks without waiting for protocol updates and magical tokens which solve everything for everyone.


Copyright © 2018 Alfa Blockchain Consulting
Published under the [AGPL 3.0](https://opensource.org/licenses/AGPL-3.0).
