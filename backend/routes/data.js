const express = require('express');
const Joi = require('joi');
const ZKProofSimulator = require('../services/zkProof');
const blockchainService = require('../services/blockchain');
const dataStorage = require('../services/dataStorage');

const router = express.Router();

// Validation schema for health data
const healthDataSchema = Joi.object({
  userAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  heartRate: Joi.number().min(30).max(220).required(),
  sleepHours: Joi.number().min(0).max(24).required(),
  steps: Joi.number().min(0).max(100000).required(),
  timestamp: Joi.number().optional()
});

/**
 * POST /api/data/submit
 * Submit health data with ZK proof verification
 */
router.post('/submit', async (req, res) => {
  try {
    // Validate request data
    const { error, value } = healthDataSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const healthData = {
      ...value,
      timestamp: value.timestamp || Date.now()
    };

    console.log(`📊 Processing health data submission from ${healthData.userAddress}`);

    // Step 1: Generate ZK proof (simulated)
    const zkResult = ZKProofSimulator.generateProof(healthData);
    
    if (!zkResult.success) {
      return res.status(400).json({
        success: false,
        error: 'ZK proof generation failed',
        details: zkResult.error
      });
    }

    // Step 2: Store data off-chain
    const storeSuccess = dataStorage.storeHealthData({
      ...healthData,
      zkProof: zkResult.proof,
      dataHash: zkResult.dataHash
    });

    if (!storeSuccess) {
      return res.status(500).json({
        success: false,
        error: 'Failed to store health data'
      });
    }

    // Step 3: Submit data hash to blockchain
    const blockchainResult = await blockchainService.submitDataHash(zkResult.dataHash);

    if (!blockchainResult.success) {
      console.error('Blockchain submission failed:', blockchainResult.error);
      // Continue anyway for MVP - data is stored off-chain
    }

    // Step 4: Get updated user stats
    const submissionCount = dataStorage.getUserSubmissionCount(healthData.userAddress);
    const tokenBalance = await blockchainService.getUserTokenBalance(healthData.userAddress);

    console.log(`✅ Health data submitted successfully by ${healthData.userAddress}`);

    res.json({
      success: true,
      message: 'Health data submitted successfully',
      data: {
        zkProof: {
          verified: true,
          proof: zkResult.proof,
          verificationTime: zkResult.verificationTime
        },
        blockchain: blockchainResult,
        user: {
          address: healthData.userAddress,
          submissionCount: submissionCount,
          tokenBalance: tokenBalance
        },
        dataHash: zkResult.dataHash,
        timestamp: zkResult.timestamp
      }
    });

  } catch (error) {
    console.error('Error submitting health data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/data/stats
 * Get anonymized platform statistics for buyers
 */
router.get('/stats', async (req, res) => {
  try {
    // Get anonymized statistics
    const stats = dataStorage.getAnonymizedStats();
    
    if (!stats) {
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve statistics'
      });
    }

    // Get additional blockchain stats
    const blockchainStats = await blockchainService.getPlatformStats();

    console.log('📈 Platform statistics requested');

    res.json({
      success: true,
      data: {
        platform: {
          ...stats,
          blockchain: blockchainStats
        },
        metadata: {
          dataSource: 'anonymized_aggregation',
          privacyLevel: 'high',
          lastUpdated: stats.lastUpdated
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/data/user/:address
 * Get user-specific submission statistics
 */
router.get('/user/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    // Get user statistics
    const submissionCount = dataStorage.getUserSubmissionCount(address);
    const blockchainCount = await blockchainService.getUserSubmissionCount(address);
    const tokenBalance = await blockchainService.getUserTokenBalance(address);

    console.log(`👤 User statistics requested for ${address}`);

    res.json({
      success: true,
      data: {
        userAddress: address,
        submissions: {
          offChain: submissionCount,
          onChain: blockchainCount
        },
        rewards: {
          tokenBalance: tokenBalance,
          totalEarned: (blockchainCount * 10).toString() // 10 tokens per submission
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/data/verify
 * Verify ZK proof (for testing/demonstration)
 */
router.post('/verify', async (req, res) => {
  try {
    const { proof, dataHash } = req.body;

    if (!proof || !dataHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing proof or dataHash'
      });
    }

    const isValid = ZKProofSimulator.verifyProof(proof, dataHash);

    res.json({
      success: true,
      data: {
        valid: isValid,
        proof: proof,
        dataHash: dataHash,
        verifiedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error verifying proof:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
