// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract People {

    Person public moi;

    struct Person {
        string name;
        uint age;
    }

    function modifyPerson(string memory _name, uint _age) public  {
        moi.name = _name;
        moi.age = _age;

        /*
        * Autre solution possible
        *
        * moi = Person(_name, _age);
        *
        */
    }
}