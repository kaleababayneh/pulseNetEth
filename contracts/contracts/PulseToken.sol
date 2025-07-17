// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PulseToken is ERC20, Ownable {
    uint256 public constant REWARD_AMOUNT = 10 * 10**18; // 10 tokens per submission
    
    // Address of the PulseNet contract that can mint rewards
    address public pulseNetContract;
    
    constructor(address initialOwner) ERC20("PulseToken", "PULSE") Ownable(initialOwner) {
        // Mint initial supply to owner for any manual distributions
        _mint(initialOwner, 100000 * 10**18); // 100k tokens for initial distribution
    }
    
    /**
     * @dev Set the PulseNet contract address (only owner)
     * @param _pulseNetContract Address of the PulseNet contract
     */
    function setPulseNetContract(address _pulseNetContract) external onlyOwner {
        pulseNetContract = _pulseNetContract;
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Allow PulseNet contract to mint tokens for user rewards
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mintReward(address to, uint256 amount) external {
        require(msg.sender == pulseNetContract, "Only PulseNet contract can mint rewards");
        _mint(to, amount);
    }
}
