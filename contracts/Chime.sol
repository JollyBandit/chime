// SPDX-License-Identifier: MIT

pragma solidity 0.8.0;

import "hardhat/console.sol";

contract Chime{

    constructor(){
        // address owner = msg.sender;
    }

    mapping(address => string) private sentMessages;
    mapping(address => string) private receivedMessages;

    //Friends list & Block list
    mapping(string => address) private friends;
    mapping(string => address) private blockList;
    
    enum relationship_type{
        none,
        friend,
        block
    }

    struct person{
        string name;
        relationship_type relationship;
    }

    //List of friends & blocked users
    mapping(address => person) public list;

    function addToList(address _addr, string memory _name, relationship_type _relationship) public{
        list[_addr] = person(_name, _relationship);
    }

    function getName(address _addr) public view returns(string memory _name){
        return list[_addr].name;
    }

    function getRelationship(address _addr) public view returns(relationship_type _relationship){
        return list[_addr].relationship;
    }

    //Send a message to someone
    function sendMessage(address _to, string memory _message) public{

    }
}