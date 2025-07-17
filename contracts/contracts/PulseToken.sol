// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseToken is ERC20, Ownable {
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens per submission
    
    address public pulseNetContract;
    
    constructor(address initialOwner) ERC20("PulseToken", "PULSE") Ownable(initialOwner) {
        _mint(initialOwner, 100000 * 10**18);
    }

    function setPulseNetContract(address _pulseNetContract) external onlyOwner {
        pulseNetContract = _pulseNetContract;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function mintReward(address to, uint256 amount) external {
        require(msg.sender == pulseNetContract, "Only PulseNet contract can mint rewards");
        _mint(to, amount);
    }
}