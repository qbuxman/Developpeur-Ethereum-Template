// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract Bank {

    mapping (address => uint) _balances;

    function deposit (uint _amount) public {
        _balances[msg.sender] += _amount;
    }

    function transfer (address _recipient, uint _amount) public {
        require(_recipient != address(0), "You cannot transfer to the address zero"); // Ajouté à la correction
        require(balanceOf(msg.sender) >= _amount, unicode"Vous n'avez pas assez de fond pour réaliser la transaction.");

        _balances[msg.sender] -= _amount;
        _balances[_recipient] += _amount; 
    }

    function balanceOf (address _address) public view returns (uint) {
        return _balances[_address];
    }
}