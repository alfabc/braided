
// Tests the agent which reads blocks, records block/hashes, 
// reads block/hashes, issues alerts, and writes confirmations.

// To make this testable, the Agent contains callback functions
// which are used to subscribe to Web3 notifications for new
// blocks and for `Shackle.addBlock()`

// So, for a given agent, we can test it by creating an object
// and throwing a bunch of alerts at it. We don't have to mock
// the Web3 calls.

// However, if we want to check the block/hashes against real
// blocks and hashes on the *watched* chains as well, then
// we'll need to mock the Web3 calls for those chains.

Given an agent AgentA
And a recording chain Chain1
And a watched chain Chain2
And a watched chain Chain3
And a watched chain Chain4

// Test the recording of new blocks from a watched chain
Chain1 should subscribe to block notifications for Chain2-3-4
When the watched Chain2-4 produces a new block 101
  ... And its block number is higher than the current highest block number on the recording chain Chain1 (100)
    Then the block/hash should be added to Chain1

  ...  And the block number is less than the current highest block number
    // the Agent for Chain2-4 might just be behind
    Then AgentA should log an EVENT
    // perhaps start a counter? issue an alert after X occurrances?

// Recording chain should watch out for itself
Chain1 should subscribe to addBlock events for Chain1 from Chain2-4
When the watched chain adds a new block/hash
  ... and the block number exists in the local chain

    // The recording node might be behind. If it stays that way...
    ... and the block number does not exist in the local chain
    Then AgentA should log an EVENT
    // perhaps start a counter? issue an alert after X occurrances?

    ... and the block number exists in the local chain

       ... and the watched block/hash == hash of the block on Chain1
       // should AgentA record confirmation of its own block?
       // is this necessary or desirable?

       ... and the watched block/hash != hash of the block on Chain1
       // Fork detection / consensus failure
       Then AgentA should log an ALERT

// record block/hash confirmations from the watched chains
Chain1 subscribes to addBlock events for ChainX(2-4) from ChainY(2-4)
When a watched chain adds a new block/hash
  ... and ChainX.ChainY block number >= Chain1.getHighestBlockNumber(ChainY) 
  ... and the new block/hash is not already recorded in the Shackle contract on Chain1
    Then the block/hash should be added to Chain1

  ... and the block number is 

When the watched chain produces a new block
And the new block is already recorded in the Shackle contract on the recording chain
If the block hash matches the block hash recorded in the Shackle contract
Then nothing happens
Else
an error is reported (MECHANISM?)

When the watched chain produces a new block
And a higher block number already exists 
