pragma solidity 0.8.0;

import "hardhat/console.sol";

contract Chime{
    address owner = msg.sender;


    function setOwner(address _owner) public{
        owner = _owner;
    }

    function sendMessage(string memory _message) public{
        
    }
}