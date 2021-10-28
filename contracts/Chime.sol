pragma solidity 0.8.0;

import "hardhat/console.sol";

contract Chime{

    constructor{
            address owner = msg.sender;
    }

    mapping(address => string) private sentMessages;
    mapping(address => string) private receivedMessages;

    //Friends list & Block list
    mapping(string => address) private friends;
    address[] private blockList;

    function addFriend(string _name, address _addr) public{
        friends[_name] = _addr;
    }

    function removeFriend(string _name) public{
        delete friends[_name];
    }

    function addBlock(address _addr) public{
        blockList.add(_addr);
    }

    function removeBlock(address _addr) public{
        blockList.remove(_addr);
    }

    //Send a message to someone
    function sendMessage(address _to, string memory _message) public{

    }
}