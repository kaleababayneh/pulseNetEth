const express = require('express');
const blockchainService = require('../services/blockchain');

const router = express.Router();

/**
 * POST /api/rewards/manual
 * Manually reward a user (admin only)
 */
router.post('/manual', async (req, res) => {
  try {
    const { userAddress, amount, adminKey } = req.body;

    // Basic admin authentication (in production, use proper auth)
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - Invalid admin key'
      });
    }

    // Validate inputs
    if (!userAddress || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user address'
      });
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid reward amount'
      });
    }

    console.log(`💰 Manual reward initiated: ${amount} tokens to ${userAddress}`);

    // This would call the smart contract's rewardUser function
    // For MVP, we'll simulate this
    const result = {
      success: true,
      transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
      blockNumber: Math.floor(Math.random() * 1000000) + 18000000,
      gasUsed: '21000'
    };

    res.json({
      success: true,
      message: 'Manual reward processed successfully',
      data: {
        userAddress,
        amount: amount.toString(),
        transaction: result,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error processing manual reward:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/rewards/balance/:address
 * Get token balance for a user
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    const balance = await blockchainService.getUserTokenBalance(address);
    const submissionCount = await blockchainService.getUserSubmissionCount(address);

    res.json({
      success: true,
      data: {
        address,
        balance,
        submissionCount,
        totalEarned: (submissionCount * 10).toString(), // 10 tokens per submission
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving balance:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/rewards/leaderboard
 * Get top contributors (anonymized)
 */
router.get('/leaderboard', async (req, res) => {
  try {
    // This would typically query the blockchain for top contributors
    // For MVP, we'll return mock data
    const leaderboard = [
      { rank: 1, contributions: 50, rewards: '500.0' },
      { rank: 2, contributions: 45, rewards: '450.0' },
      { rank: 3, contributions: 40, rewards: '400.0' },
      { rank: 4, contributions: 35, rewards: '350.0' },
      { rank: 5, contributions: 30, rewards: '300.0' }
    ];

    res.json({
      success: true,
      data: {
        leaderboard,
        totalContributors: 150,
        totalRewardsDistributed: '15000.0',
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
