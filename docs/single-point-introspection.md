# Introduction
Single-point introspection is a method for fulfilling the use case "Transaction integrity verification" in which a user wants to determine the degree of confidence that a transasction and its associated history has not been falsified.

# Method
From a particular chain, an end user accesses braided.eth and enters their TXID in the search box.

Braided.eth looks at the instance of the Braided contract which braided.eth currently points to.  It checks the transaction ID and sees which block it was included in, and how many confirmations exist. (This is analogous to what Etherscan provides today for each chain.)

The Braided dapp then enumerates the strands listed in the Braided contract on the current chain.  Each of these strands lists the client type, network number, genesis block hash, first and last block recorded for that chain, and total number of blocks recorded for that chain.

The braided contract may also reference an earlier contract.  This is useful when there is a fork in the chain on which it resides, a disagreement in governance of the Braided contract, or other practical reasons for having multiple instances. The Braided dapp can also check this previous braid and its strands in the same way.

Having established a tree of braids and strands, the dapp begins by determining whether the block containing the transaction is included in the range of blocks recorded for the chain on which it exists.  If it exists in the range, then either the block number itself or the next recorded block number is considered.  This block is then considered in the same way.

The appearance of that block hash (or subsequent block hashes) on multiple strands helps to increase the confidence measure.

The appearance of the exact block which contains the transaction on (an)other strand(s) gives a higher amount of confidence. The appearance of those blocks on the other strand(s) gives further confidence. Identical block/hashes recorded on multiple strands on different chains gives even more confidence. The number of braids traversed in the course of a validation greatly increases the confidence. These confidence points are calculated to give a score for a particular transaction, a score that increases over time as further blocks are recorded.
