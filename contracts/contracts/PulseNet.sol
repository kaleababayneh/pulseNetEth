// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PulseToken.sol";

contract PulseNet is Ownable {
    PulseToken public pulseToken;
    
   
    mapping(address => uint256) public submissionCount;
    mapping(address => bool) public authorizedBuyers;
    mapping(bytes32 => bool) public submittedHashes;
    
    event DataSubmitted(address indexed user, bytes32 indexed dataHash, uint256 timestamp);
    event UserRewarded(address indexed user, uint256 amount);
    event BuyerAuthorized(address indexed buyer, bool authorized);
    
    uint256 public totalSubmissions;
    uint256 public uniqueContributors;
    mapping(address => bool) public hasSubmitted;
    
    constructor(address _pulseToken, address initialOwner) Ownable(initialOwner) {
        pulseToken = PulseToken(_pulseToken);
    }
    
    function submitData(bytes32 dataHash) external {
        require(dataHash != bytes32(0), "Invalid data hash");
        require(!submittedHashes[dataHash], "Data already submitted");
        
        submittedHashes[dataHash] = true;
        submissionCount[msg.sender]++;
        totalSubmissions++;
        
        // Track unique contributors
        if (!hasSubmitted[msg.sender]) {
            hasSubmitted[msg.sender] = true;
            uniqueContributors++;
        }
        
        emit DataSubmitted(msg.sender, dataHash, block.timestamp);
        
        // Auto-reward user
        _rewardUser(msg.sender, pulseToken.REWARD_AMOUNT());
    }

    function _rewardUser(address user, uint256 amount) internal {
        pulseToken.mintReward(user, amount);
        emit UserRewarded(user, amount);
    }

    function rewardUser(address user, uint256 amount) external onlyOwner {
        _rewardUser(user, amount);
    }

    function getSubmissionCount(address user) external view returns (uint256) {
        return submissionCount[user];
    }

    function setBuyer(address buyer, bool authorized) external onlyOwner {
        authorizedBuyers[buyer] = authorized;
        emit BuyerAuthorized(buyer, authorized);
    }

    function getPlatformStats() external view returns (uint256 totalSubs, uint256 uniqueUsers) {
        return (totalSubmissions, uniqueContributors);
    }

    function isBuyerAuthorized(address buyer) external view returns (bool) {
        return authorizedBuyers[buyer];
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = pulseToken.balanceOf(address(this));
        pulseToken.transfer(owner(), balance);
    }
}