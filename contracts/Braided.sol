pragma solidity ^0.4.24;

import "./BraidedInterface.sol";
import "openzeppelin-solidity/contracts/ownership/Superuser.sol";


// Smart contract for interchain linking
contract Braided is BraidedInterface, Superuser {

  // Strand identifies a specific chain + contract on which block/hashes are stored
  struct Strand {
    uint strandID;
    address strandContract; // must support BraidedInterface if present
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
  string constant INVALID_STRAND = "invalid strand";
  string constant NO_PERMISSION = "no permission";

  // roles
  mapping (uint => Roles.Role) private addBlockRoles;

  Strand[] public strands;
  mapping(uint => uint) internal strandIndexByStrandID;
  mapping(uint => Block[]) internal blocks;
  mapping(uint => mapping(uint => uint)) internal blockByNumber;

  event BlockAdded(uint indexed strandID, uint indexed blockNumber, bytes32 blockHash);

  constructor() public {
    // Strand 0 is reserved
    strands.push(Strand(0, 0, 0, ""));
  }

  // Add a strand
  function addStrand(uint strandID, address strandContract, bytes32 genesisBlockHash, string description) external onlyOwnerOrSuperuser() {
    // strand 0 is reserved
    require(strandID != 0, INVALID_STRAND);
    // strandID must not already be in use
    require(strandIndexByStrandID[strandID] == 0, INVALID_STRAND);
    // Add the strand
    strands.push(Strand(strandID, strandContract, genesisBlockHash, description));
    // make it possible to find the strand in the array by strandID
    strandIndexByStrandID[strandID] = strands.length - 1;
  }

  // make a method require a known strand
  modifier validStrandID(uint strandID) {
    require(strandIndexByStrandID[strandID] != 0, INVALID_STRAND);
    _;
  }

  // return total number of strands
  function getStrandCount() external view returns (uint) {
    return strands.length - 1;
  }

  // retrieve strandID from the zero-based index
  function getStrandID(uint strandIndex) external view returns(uint) {
    require(strandIndex < strands.length, INVALID_STRAND);
    // the 0 in the index is reserved for "invalid"
    return strands[strandIndex + 1].strandID;
  }

  // get the Braided Contract deployed on the specified strand (if any).
  // If a new instance of the Braided Contract is deployed, then that will
  // have to be a new Strand ID.
  function getStrandContract(uint strandID) external view validStrandID(strandID) returns (address) {
    return strands[strandIndexByStrandID[strandID]].strandContract;
  }

  // get the genesis block hash for the specified strand
  function getStrandGenesisBlockHash(uint strandID) external view validStrandID(strandID) returns (bytes32) {
    return strands[strandIndexByStrandID[strandID]].genesisBlockHash;
  }

  // get the description for the specified strand
  function getStrandDescription(uint strandID) external view validStrandID(strandID) returns (string) {
    return strands[strandIndexByStrandID[strandID]].description;
  }

  // grant role to specified account
  function addAgent(address agent, uint strandID) external onlyOwnerOrSuperuser() validStrandID(strandID) {
    addBlockRoles[strandID].add(agent);
  }

  // revoke role from specied account
  function removeAgent(address agent, uint strandID) external onlyOwnerOrSuperuser() validStrandID(strandID) {
    addBlockRoles[strandID].remove(agent);
  }

  // add a block to the specified strand
  function addBlock(uint strandID, uint blockNumber, bytes32 blockHash) external validStrandID(strandID) {
    // caller must have permission
    require(addBlockRoles[strandID].has(msg.sender), NO_PERMISSION);
    // the block numbers must increase
    require(blocks[strandID].length == 0 || blocks[strandID][blocks[strandID].length - 1].blockNumber < blockNumber, INVALID_BLOCK);
    // add the block
    blocks[strandID].push(Block(blockNumber, blockHash));
    // make it possible to look up the block by block number
    blockByNumber[strandID][blockNumber] = blocks[strandID].length - 1;
    // add the event for notification
    emit BlockAdded(strandID, blockNumber, blockHash);
  }

  // get the block hash for the block number on the specified strand
  function getBlockHash(uint strandID, uint blockNumber) external view validStrandID(strandID) returns (bytes32) {
    Block memory theBlock = blocks[strandID][blockByNumber[strandID][blockNumber]];
    // blockByNumber has 0 for blocks that don't exist, 
    // which could give the wrong block, so check.
    require(theBlock.blockNumber == blockNumber, INVALID_BLOCK);
    return theBlock.blockHash;
  }

  // get the highest block number recorded for the specified strand
  function getHighestBlockNumber(uint strandID) external view validStrandID(strandID) returns (uint) {
    return blocks[strandID][blocks[strandID].length - 1].blockNumber;
  }

  // get the previous block number recorded to the one supplied for the
  // specified strand (used to walk the strand backwards)
  function getPreviousBlockNumber(uint strandID, uint blockNumber) external view validStrandID(strandID) returns (uint) {
    return blocks[strandID][blockByNumber[strandID][blockNumber] - 1].blockNumber;
  }

  // get the previous block recorded to the one supplied for the specified
  // strand (used to walk the strand backwards)
  function getPreviousBlock(uint strandID, uint blockNumber) external view validStrandID(strandID)
    returns (uint prevBlockNumber, bytes32 prevBlockHash) { // solium-disable-line lbrace
    Block memory theBlock = blocks[strandID][blockByNumber[strandID][blockNumber] - 1];
    prevBlockNumber = theBlock.blockNumber;
    prevBlockHash = theBlock.blockHash;
  }
}
