pragma solidity ^0.5.7;

// A common external interface to Braided contracts
// which allows payment to the contract to be routed
// to an agent (or other).
interface PayableInterface {
  // set the payee
  function setPayee(address payable) external;
  function setStrandPayee(address payable, uint) external;
  // just send money
  function() external payable;
  // send money for a specific strand
  function pay(uint) external payable;
}
