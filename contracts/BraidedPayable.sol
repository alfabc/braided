pragma solidity ^0.5.7;

import "./Braided.sol";
import "./PayableInterface.sol";

// Braided contract that can accept payments
contract BraidedPayable is Braided, PayableInterface {
  address payable[] public strandPayees;

  function setPayee(address payable payee) external {
    strandPayees[0] = payee;
  }

  function setStrandPayee(address payable payee, uint strandID) external validStrandID(strandID) {
    strandPayees[strandIndexByStrandID[strandID]] = payee;
  }

  function() external payable {
    address payable payee = (uint160(strandPayees[0]) == 0) ? address(uint160(owner())) : strandPayees[0];
    payee.transfer(msg.value);
  }

  function pay(uint strandID) external payable validStrandID(strandID) {
    address payable payee = (uint160(strandPayees[strandIndexByStrandID[strandID]]) == 0) ? address(uint160(owner())) : strandPayees[strandIndexByStrandID[strandID]];
    payee.transfer(msg.value);
  }
}

