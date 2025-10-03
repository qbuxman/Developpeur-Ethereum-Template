// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract Whitelist {

    mapping (address => bool) whitelist;

    event Authorized(address _address);

    constructor () {
        whitelist[msg.sender] = true;
    }

    function authorize(address _address) public {
        require(check(), unicode"Unfortunetly, you're not authorized to do this :(");
            whitelist[_address] = true;
            emit Authorized(_address);
    }

    function check() private view returns (bool)  {
        return whitelist[msg.sender];
    }
}