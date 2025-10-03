// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract GetTime {

    function getTime() public view returns(uint) {
        return block.timestamp;
    }
}