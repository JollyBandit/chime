// contracts/ChimeToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract ChimeToken is ERC20, VRFConsumerBase {
    address public VRFCoordinator = 0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B;
    address public LinkToken = 0x01BE23585060835E02B77ef475b0Cc51aA1e0709;
    bytes32 internal keyHash = 0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311;
    uint256 internal fee = 0.1 * 10 ** 18; // 0.1 LINK
    uint256 public randomResult;
    address public maintainer;
    uint256 internal initialSupply;
    uint256 public transferValue;
    bool public winner;

    constructor(
        string memory name,
        string memory symbol
    )
        ERC20(name, symbol)
        VRFConsumerBase(VRFCoordinator, LinkToken)
    {
        maintainer = msg.sender;
        initialSupply = 1000000 * 10 ** decimals();
        //Mint tokens to this contract
        _mint(address(this), initialSupply);
        winner = false;
    }

    function randomWinner(uint256 msgValue) public{
        transferValue = randomResult / 10 ** 75;
        require(
            randomResult != 0,
            "Get a random number first and wait for the VRF to respond!"
        );
        require(
            msgValue > transferValue,
            "You didn't win..."
        );
        require(
            winner == false,
            "Call a random number first"
        );
        uint winnerValue = transferValue * 10 ** decimals();
        _transfer(msg.sender, winnerValue);
    }

    function _transfer(address to, uint256 value) internal {
        winner = true;
        super._transfer(address(this), to, value);
    }

    function getRandomNumber() public returns (bytes32 requestId) {
        require(
            LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with faucet"
        );
        winner = false;
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness)
        internal
        override
    {
        randomResult = randomness;
    }
}
