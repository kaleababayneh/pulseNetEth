// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PulseToken.sol";

contract PulseNet is Ownable {
    PulseToken public pulseToken;
    
    // Mapping to track user submissions
    mapping(address => uint256) public submissionCount;
    mapping(address => bool) public authorizedBuyers;
    mapping(bytes32 => bool) public submittedHashes;
    
    // Events
    event DataSubmitted(address indexed user, bytes32 indexed dataHash, uint256 timestamp);
    event UserRewarded(address indexed user, uint256 amount);
    event BuyerAuthorized(address indexed buyer, bool authorized);
    
    // Statistics for buyers
    uint256 public totalSubmissions;
    uint256 public uniqueContributors;
    mapping(address => bool) public hasSubmitted;
    
    constructor(address _pulseToken, address initialOwner) Ownable(initialOwner) {
        pulseToken = PulseToken(_pulseToken);
    }
    
    /**
     * @dev Submit health data hash after ZK verification
     * @param dataHash Hash of the verified health data
     */
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
    
    /**
     * @dev Reward user with tokens (internal)
     * @param user Address to reward
     * @param amount Amount of tokens to reward
     */
    function _rewardUser(address user, uint256 amount) internal {
        pulseToken.transfer(user, amount);
        emit UserRewarded(user, amount);
    }
    
    /**
     * @dev Manual reward function (admin only)
     * @param user Address to reward
     * @param amount Amount of tokens to reward
     */
    function rewardUser(address user, uint256 amount) external onlyOwner {
        _rewardUser(user, amount);
    }
    
    /**
     * @dev Get submission count for a user
     * @param user User address
     * @return Number of submissions
     */
    function getSubmissionCount(address user) external view returns (uint256) {
        return submissionCount[user];
    }
    
    /**
     * @dev Authorize/deauthorize a buyer
     * @param buyer Buyer address
     * @param authorized Authorization status
     */
    function setBuyer(address buyer, bool authorized) external onlyOwner {
        authorizedBuyers[buyer] = authorized;
        emit BuyerAuthorized(buyer, authorized);
    }
    
    /**
     * @dev Get platform statistics (for buyers)
     * @return totalSubs Total submissions
     * @return uniqueUsers Unique contributors
     */
    function getPlatformStats() external view returns (uint256 totalSubs, uint256 uniqueUsers) {
        return (totalSubmissions, uniqueContributors);
    }
    
    /**
     * @dev Check if buyer is authorized
     * @param buyer Buyer address
     * @return Authorization status
     */
    function isBuyerAuthorized(address buyer) external view returns (bool) {
        return authorizedBuyers[buyer];
    }
    
    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = pulseToken.balanceOf(address(this));
        pulseToken.transfer(owner(), balance);
    }
}
