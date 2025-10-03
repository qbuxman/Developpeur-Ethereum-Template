// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract Whitelist {

    mapping (address => bool) whitelist;

    event Authorized(address _address);

    constructor () {
        whitelist[msg.sender] = true;
    }

    modifier check() {
        require(whitelist[msg.sender], unicode"Unfortunetly, you're not authorized to do this :(");
        _;
    }

    function authorize(address _address) check public {
        whitelist[_address] = true;
        emit Authorized(_address);
    }
}