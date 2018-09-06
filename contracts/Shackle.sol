pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/ownership/Superuser.sol";


// Smart contract for interchain linking
contract Shackle is Superuser {

  struct Block {
    uint blockNumber;
    bytes32 blockHash;
  }

  struct Chain {
    uint chainID;
    bytes32 genesisBlockHash;
    string description;
  }
  
  // error messages
  string constant INVALID_BLOCK = "invalid block";
  string constant INVALID_CHAIN = "invalid chain";
  string constant NO_PERMISSION = "no permission";

  // roles
  string constant ROLE_ADD_BLOCK = "addBlock";

  Chain[] public chains;
  mapping(uint => uint) internal chainIndexByChainID;
  mapping(uint => Block[]) internal blocks;
  mapping(uint => mapping(uint => uint)) internal blockByNumber;

  constructor() public {
    // Chain 0 is reserved
    chains.push(Chain(0,0,""));
  }

  // Add a chain
  function addChain(uint chainID, bytes32 genesisBlockHash, string description) external onlyOwnerOrSuperuser() {
    // chain 0 is reserved
    require(chainID != 0, INVALID_CHAIN);
    // chainID must not already be in use
    require(chainIndexByChainID[chainID] == 0, INVALID_CHAIN);
    // Add the chain
    chains.push(Chain(chainID, genesisBlockHash, description));
    // make it possible to find the chain in the array by chainID
    chainIndexByChainID[chainID] = chains.length - 1;
  }

  // make a method require a known chain
  modifier validChainID(uint chainID) {
    require(chainIndexByChainID[chainID] != 0, INVALID_CHAIN);
    _;
  }

  // return total number of chains
  function getChainCount() external view returns (uint) {
    return chains.length - 1;
  }

  // get the genesis block hash for the specified chain
  function getGenesisBlockHash(uint chainID) external view validChainID(chainID) returns (bytes32) {
    return chains[chainIndexByChainID[chainID]].genesisBlockHash;
  }

  // get the description for the specified chain
  function getChainDescription(uint chainID) external view validChainID(chainID) returns (string) {
    return chains[chainIndexByChainID[chainID]].description;
  }

  // grant role to specified account
  function addAgent(address agent) external onlyOwnerOrSuperuser() {
    addRole(agent, ROLE_ADD_BLOCK);
  }

  // revoke role from specied account
  function removeAgent(address agent) external onlyOwnerOrSuperuser() {
    removeRole(agent, ROLE_ADD_BLOCK);
  }

  // add a block to the specified chain
  function addBlock(uint chainID, uint blockNumber, bytes32 blockHash) external validChainID(chainID) {
    // caller must have permission
    require(hasRole(msg.sender, ROLE_ADD_BLOCK), NO_PERMISSION );
    // the block numbers must increase
    require(blocks[chainID].length == 0 || blocks[chainID][blocks[chainID].length - 1].blockNumber < blockNumber, INVALID_BLOCK);
    // add the block
    blocks[chainID].push(Block(blockNumber, blockHash));
    // make it possible to look up the block by block number
    blockByNumber[chainID][blockNumber] = blocks[chainID].length - 1;
  }

  // get the highest block number recorded for the specified chain
  function getHighestBlockNumber(uint chainID) external view validChainID(chainID) returns (uint) {
    return blocks[chainID][blocks[chainID].length - 1].blockNumber;
  }

  // get the block hash for the block number on the specified chain
  function getBlockHash(uint chainID, uint blockNumber) external view validChainID(chainID) returns (bytes32) {
    Block memory theBlock = blocks[chainID][blockByNumber[chainID][blockNumber]];
    // blockByNumber has 0 for blocks that don't exist, 
    // which could give the wrong block, so check.
    require(theBlock.blockNumber == blockNumber, INVALID_BLOCK);
    return theBlock.blockHash;
  }
}
