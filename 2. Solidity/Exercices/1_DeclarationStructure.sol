// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.30;

contract People {

    Person public moi;

    struct Person {
        string name;
        uint age;
    }
}