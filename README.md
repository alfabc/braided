[![Build Status](https://travis-ci.org/alfabc/shackle.svg?branch=master)](https://travis-ci.org/alfabc/shackle)
[![Coverage Status](https://coveralls.io/repos/github/alfabc/shackle/badge.svg?branch=master)](https://coveralls.io/github/alfabc/shackle?branch=master)

# shackle 

Shackle is a smart contract for linking together blockchains to improve their resistence to censorship and forgery.  By tying together multiple chains which are independently verfied with different consensus algorithms and trust methods, this method would make it necessary for an attacker to simultaneously attack all chains, thus increasing the cost and reducing the likelihood of a successful attack.

This is achieved by the simple method of recording recent block numbers and block hashes for different blockchains, and doing this simultaneously on multiple chains at the same time.  When executed on multiple chains which have low (or no) economic value to their gas, this makes mutual verification of chains possible without spending ETH that is worth money.

Copyright © 2018 Alfa Blockchain Consulting
Published under the [AGPL 3.0](https://opensource.org/licenses/AGPL-3.0).
