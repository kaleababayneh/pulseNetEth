const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.pulseNetContract = null;
    this.pulseTokenContract = null;
    this.initialized = false;
  }

  /**
   * Initialize blockchain connection and contracts
   */
  async initialize() {
    try {
      // Connect to Ethereum provider
      this.provider = new ethers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL || 'http://127.0.0.1:8545'
      );

      // Create signer from private key
      if (process.env.PRIVATE_KEY) {
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      } else {
        console.warn('⚠️  No private key provided, using provider signer');
        this.signer = await this.provider.getSigner();
      }

      // Load contract addresses from deployment
      const deployment = this.loadDeploymentInfo();
      
      if (deployment) {
        await this.loadContracts(deployment.contracts);
        this.initialized = true;
        console.log('✅ Blockchain service initialized');
      } else {
        console.warn('⚠️  No deployment info found, contracts not loaded');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
    }
  }

  /**
   * Load deployment information
   */
  loadDeploymentInfo() {
    try {
      const fs = require('fs');
      const path = require('path');
      const deploymentPath = path.join(__dirname, '../../contracts/deployment.json');
      
      if (fs.existsSync(deploymentPath)) {
        return JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
      }
      return null;
    } catch (error) {
      console.error('Failed to load deployment info:', error.message);
      return null;
    }
  }

  /**
   * Load smart contracts
   */
  async loadContracts(contractAddresses) {
    try {
      // PulseNet contract ABI (simplified)
      const pulseNetABI = [
        "function submitData(bytes32 dataHash) external",
        "function rewardUser(address user, uint256 amount) external",
        "function getSubmissionCount(address user) external view returns (uint256)",
        "function setBuyer(address buyer, bool authorized) external",
        "function getPlatformStats() external view returns (uint256, uint256)",
        "function isBuyerAuthorized(address buyer) external view returns (bool)",
        "event DataSubmitted(address indexed user, bytes32 indexed dataHash, uint256 timestamp)",
        "event UserRewarded(address indexed user, uint256 amount)"
      ];

      // PulseToken contract ABI (simplified)
      const pulseTokenABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function transfer(address to, uint256 amount) external returns (bool)",
        "function mint(address to, uint256 amount) external",
        "function REWARD_AMOUNT() external view returns (uint256)"
      ];

      this.pulseNetContract = new ethers.Contract(
        contractAddresses.PulseNet,
        pulseNetABI,
        this.signer
      );

      this.pulseTokenContract = new ethers.Contract(
        contractAddresses.PulseToken,
        pulseTokenABI,
        this.signer
      );

      console.log('✅ Contracts loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load contracts:', error.message);
      throw error;
    }
  }

  /**
   * Submit data hash to blockchain
   */
  async submitDataHash(dataHash) {
    if (!this.initialized || !this.pulseNetContract) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const tx = await this.pulseNetContract.submitData(dataHash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to submit data hash:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user submission count
   */
  async getUserSubmissionCount(userAddress) {
    if (!this.initialized || !this.pulseNetContract) {
      return 0;
    }

    try {
      const count = await this.pulseNetContract.getSubmissionCount(userAddress);
      return parseInt(count.toString());
    } catch (error) {
      console.error('Failed to get submission count:', error.message);
      return 0;
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats() {
    if (!this.initialized || !this.pulseNetContract) {
      return { totalSubmissions: 0, uniqueContributors: 0 };
    }

    try {
      const [totalSubs, uniqueUsers] = await this.pulseNetContract.getPlatformStats();
      return {
        totalSubmissions: parseInt(totalSubs.toString()),
        uniqueContributors: parseInt(uniqueUsers.toString())
      };
    } catch (error) {
      console.error('Failed to get platform stats:', error.message);
      return { totalSubmissions: 0, uniqueContributors: 0 };
    }
  }

  /**
   * Check if buyer is authorized
   */
  async isBuyerAuthorized(buyerAddress) {
    if (!this.initialized || !this.pulseNetContract) {
      return false;
    }

    try {
      return await this.pulseNetContract.isBuyerAuthorized(buyerAddress);
    } catch (error) {
      console.error('Failed to check buyer authorization:', error.message);
      return false;
    }
  }

  /**
   * Get user token balance
   */
  async getUserTokenBalance(userAddress) {
    if (!this.initialized || !this.pulseTokenContract) {
      return '0';
    }

    try {
      const balance = await this.pulseTokenContract.balanceOf(userAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Failed to get token balance:', error.message);
      return '0';
    }
  }
}

// Create singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
