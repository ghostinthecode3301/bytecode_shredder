// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0;

contract SimpleStorage {
  string value;

  event ValueChanged(address indexed author, string oldValue, string newValue);

  constructor(string memory _value) {
    setValue(_value);
  }

  function getValue() public view returns (string memory) {
    return value;
  }

  function setValue(string memory _value) public {
    emit ValueChanged(msg.sender, value, _value);
    value = _value;
  }
}
