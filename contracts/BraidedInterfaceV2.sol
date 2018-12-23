pragma solidity ^0.4.25;

// A common external interface to Braided contracts, with additional methods
// not present in the original BraidedInterface
interface BraidedInterfaceV2 {
  function getCreationBlockNumber() external view returns (uint);
  function addStrand(uint, address, bytes32, string) external;
  function getStrandCount() external view returns (uint);
  function getStrandID(uint) external view returns(uint);
  function getStrandCreationBlockNumber(uint) external view returns(uint);
  function getStrandContract(uint) external view returns (address);
  function getStrandGenesisBlockHash(uint) external view returns (bytes32);
  function getStrandDescription(uint) external view returns (string);
  function addAgent(address, uint) external;
  function removeAgent(address, uint) external;
  function addBlock(uint, uint, bytes32) external;
  function getBlockCount(uint) external view returns (uint);
  function getBlockHash(uint, uint) external view returns (bytes32);
  function getHighestBlockNumber(uint) external view returns (uint);
  function getLowestBlockNumber(uint) external view returns (uint);
  function getPreviousBlockNumber(uint, uint) external view returns (uint);
  function getPreviousBlock(uint, uint) external view returns (uint, bytes32);
}
