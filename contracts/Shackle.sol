pragma solidity ^0.4.24;


contract Shackle {

  struct Chain {
    uint chainID;
    bytes32 genesisBlockHash;
    string description;
  }

  Chain[] public chains;
  mapping(uint => uint) internal chainIndexByChainID;

  constructor() public {
    // Chain 0 is reserved
    chains.push(Chain(0,0,""));
  }

  // Add a chain
  function addChain(uint chainID, bytes32 genesisBlockHash, string description) external {
    // chain 0 is reserved
    require(chainID != 0, "invalid chain ID");
    require(chainIndexByChainID[chainID] == 0, "chain ID in use");
    chains.push(Chain(chainID, genesisBlockHash, description));
    chainIndexByChainID[chainID] = chains.length - 1;
  }

  modifier validChainID(uint chainID) {
    require(chainIndexByChainID[chainID] != 0, "invalid chain");
    _;
  }

  function getChainCount() external view returns (uint) {
    return chains.length - 1;
  }

  function getChainGenesisBlockHashByChainID(uint chainID) external view validChainID(chainID) returns (bytes32) {
    return chains[chainIndexByChainID[chainID]].genesisBlockHash;
  }

  function getChainDescriptionByChainID(uint chainID) external view validChainID(chainID) returns (string) {
    return chains[chainIndexByChainID[chainID]].description;
  }

  function recordBlock(uint chainID, uint blockNumber, bytes32 blockHash) external validChainID(chainID) {
  }
}
