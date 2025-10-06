// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract Random {

    uint private nonce = 0;

    function random () public view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.timestamp, nonce, msg.sender))) % 100;
    }
}