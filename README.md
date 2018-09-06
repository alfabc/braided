[![Build Status](https://travis-ci.org/alfabc/shackle.svg?branch=master)](https://travis-ci.org/alfabc/shackle)
[![Coverage Status](https://coveralls.io/repos/github/alfabc/shackle/badge.svg?branch=master)](https://coveralls.io/github/alfabc/shackle?branch=master)

# shackle 

## Overview
Shackle improves the censorship and forgery resistance of Ethereum blockchains by using smart contracts to share block hashes among multiple chains.  By tying together multiple, independently verified chains with different consensus algorithms and trust methods, this method would make it necessary for an attacker to simultaneously attack all chains, thus increasing the cost and reducing the likelihood of a successful attack.

This is achieved by the simple method of recording recent block numbers and block hashes for different blockchains, and doing this simultaneously on multiple chains at the same time.  When executed on multiple chains which have low (or no) economic value to their gas, this makes mutual verification of chains possible without spending ETH that is worth money.

## Limitations
In order to provide the necessary security on multiple blockchains now, without requiring forks, changes to consensus algorithms or agreements between multiple parties with different interests, this solution is limited in multiple ways which makes it in some ways naive: it does not inherently scale to an infinite number of chains, nor does it allow for trust-free participation of recorders, nor does it automatically provide on-chain notification of the detection of irregularites.  Instead it is intended to provide observers with a convenient data source, useful tools for analysis and timely alerts.

## Roles
The contract is deployed on each blockchain, each with an owner who can license agents with the permission to record hashes.  The owner can issue and revoke that license; the agent cannot do anything but record hashes. The owner can also add new blockchains (but not delete chains or hashes).

Copyright © 2018 Alfa Blockchain Consulting
Published under the [AGPL 3.0](https://opensource.org/licenses/AGPL-3.0).
