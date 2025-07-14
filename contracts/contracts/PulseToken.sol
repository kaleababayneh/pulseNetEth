// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseToken is ERC20, Ownable {
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens per submission
    
    constructor(address initialOwner) ERC20("PulseToken", "PULSE") Ownable(initialOwner) {
        // Mint initial supply to owner for rewards
        _mint(initialOwner, 1000000 * 10**18); // 1M tokens
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
