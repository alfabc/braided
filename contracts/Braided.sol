pragma solidity ^0.4.24;

import "./BraidedInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Superuser.sol";


// Smart contract for interchain linking
contract Braided is BraidedInterface, Superuser {

  // identifies a specific chain that for which block/hashes are stored
  struct Chain {
    uint chainID;
    address braidedContract; // must support BraidedInterface if present
    bytes32 genesisBlockHash;
    string description;
  }
  
  // identifies a block by number and its hash
  struct Block {
    uint blockNumber;
    bytes32 blockHash;
  }

  // error messages
  string constant INVALID_BLOCK = "invalid block";
  string constant INVALID_CHAIN = "invalid chain";
  string constant NO_PERMISSION = "no permission";

  // roles
  mapping (uint => Roles.Role) private addBlockRoles;

  Chain[] public chains;
  mapping(uint => uint) internal chainIndexByChainID;
  mapping(uint => Block[]) internal blocks;
  mapping(uint => mapping(uint => uint)) internal blockByNumber;

  constructor() public {
    // Chain 0 is reserved
    chains.push(Chain(0, 0, 0, ""));
  }

  // Add a chain
  function addChain(uint chainID, address braidedContract, bytes32 genesisBlockHash, string description) external onlyOwnerOrSuperuser() {
    // chain 0 is reserved
    require(chainID != 0, INVALID_CHAIN);
    // chainID must not already be in use
    require(chainIndexByChainID[chainID] == 0, INVALID_CHAIN);
    // Add the chain
    chains.push(Chain(chainID, braidedContract, genesisBlockHash, description));
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

  // get the Braided Contract deployed on the specified chain (if any).
  // If a new instance of the Braided Contract is deployed, then that will
  // have to be a new Chain ID.
  function getBraidedContract(uint chainID) external view validChainID(chainID) returns (address) {
    return chains[chainIndexByChainID[chainID]].braidedContract;
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
  function addAgent(address agent, uint chainID) external onlyOwnerOrSuperuser() validChainID(chainID) {
    addBlockRoles[chainID].add(agent);
  }

  // revoke role from specied account
  function removeAgent(address agent, uint chainID) external onlyOwnerOrSuperuser() validChainID(chainID) {
    addBlockRoles[chainID].remove(agent);
  }

  // add a block to the specified chain
  function addBlock(uint chainID, uint blockNumber, bytes32 blockHash) external validChainID(chainID) {
    // caller must have permission
    require(addBlockRoles[chainID].has(msg.sender), NO_PERMISSION);
    // the block numbers must increase
    require(blocks[chainID].length == 0 || blocks[chainID][blocks[chainID].length - 1].blockNumber < blockNumber, INVALID_BLOCK);
    // add the block
    blocks[chainID].push(Block(blockNumber, blockHash));
    // make it possible to look up the block by block number
    blockByNumber[chainID][blockNumber] = blocks[chainID].length - 1;
  }

  // get the block hash for the block number on the specified chain
  function getBlockHash(uint chainID, uint blockNumber) external view validChainID(chainID) returns (bytes32) {
    Block memory theBlock = blocks[chainID][blockByNumber[chainID][blockNumber]];
    // blockByNumber has 0 for blocks that don't exist, 
    // which could give the wrong block, so check.
    require(theBlock.blockNumber == blockNumber, INVALID_BLOCK);
    return theBlock.blockHash;
  }

  // get the highest block number recorded for the specified chain
  function getHighestBlockNumber(uint chainID) external view validChainID(chainID) returns (uint) {
    return blocks[chainID][blocks[chainID].length - 1].blockNumber;
  }

  // get the previous block number recorded to the one supplied for the
  // specified chain (used to walk the chain backwards)
  function getPreviousBlockNumber(uint chainID, uint blockNumber) external view validChainID(chainID) returns (uint) {
    return blocks[chainID][blockByNumber[chainID][blockNumber] - 1].blockNumber;
  }

  // get the previous block recorded to the one supplied for the specified
  // chain (used to walk the chain backwards)
  function getPreviousBlock(uint chainID, uint blockNumber) external view validChainID(chainID)
    returns (uint prevBlockNumber, bytes32 prevBlockHash) { // solium-disable-line lbrace
    Block memory theBlock = blocks[chainID][blockByNumber[chainID][blockNumber] - 1];
    prevBlockNumber = theBlock.blockNumber;
    prevBlockHash = theBlock.blockHash;
  }
}
