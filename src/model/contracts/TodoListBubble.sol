// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";


contract TodoListBubble is AccessControlledStorage {

  address owner = msg.sender;
  address appKey;
  bool terminated = false;

  constructor(address _appKey) {
    appKey = _appKey;
  }

  function getAccessPermissions( address user, uint256 /*contentId*/ ) external view override returns (uint256) {
    if (terminated) return BUBBLE_TERMINATED_BIT;
    else if (user == owner || user == appKey) return READ_BIT | WRITE_BIT | APPEND_BIT;
    else return NO_PERMISSIONS;
  }

  function terminate() external {
    require (msg.sender == owner, "permission denied");
    terminated = true;
  }
  
}