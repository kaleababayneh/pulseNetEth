const express = require('express');
const Joi = require('joi');
const crypto = require('crypto');

const router = express.Router();

// In-memory storage for user registrations and device fingerprints
// In production, this should be replaced with a proper database
const userRegistry = new Map();
const deviceFingerprints = new Map();

// Validation schemas
const userRegistrationSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  deviceFingerprint: Joi.string().min(32).required(),
  timestamp: Joi.number().optional()
});

const verificationSchema = Joi.object({
  walletAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  deviceFingerprint: Joi.string().min(32).required()
});

/**
 * POST /api/user/register
 * Register a user with device fingerprint for anti-Sybil protection
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request data
    const { error, value } = userRegistrationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { walletAddress, deviceFingerprint } = value;
    const timestamp = value.timestamp || Date.now();

    console.log(`🔐 Processing user registration for ${walletAddress}`);

    // Check if this device fingerprint is already registered
    if (deviceFingerprints.has(deviceFingerprint)) {
      const existingUser = deviceFingerprints.get(deviceFingerprint);
      if (existingUser.walletAddress !== walletAddress) {
        return res.status(409).json({
          success: false,
          error: 'Device already registered with different wallet',
          code: 'DEVICE_ALREADY_REGISTERED'
        });
      }
    }

    // Check if this wallet is already registered
    if (userRegistry.has(walletAddress)) {
      const existingData = userRegistry.get(walletAddress);
      if (existingData.deviceFingerprint !== deviceFingerprint) {
        return res.status(409).json({
          success: false,
          error: 'Wallet already registered with different device',
          code: 'WALLET_ALREADY_REGISTERED'
        });
      }
      
      // User already registered with same device - return success
      return res.json({
        success: true,
        message: 'User already registered',
        data: {
          walletAddress,
          registeredAt: existingData.registeredAt,
          verified: true
        }
      });
    }

    // Generate a unique registration ID
    const registrationId = crypto.randomUUID();

    // Store user registration
    const userData = {
      walletAddress,
      deviceFingerprint,
      registrationId,
      registeredAt: new Date(timestamp).toISOString(),
      verified: true,
      lastActivity: new Date().toISOString()
    };

    userRegistry.set(walletAddress, userData);
    deviceFingerprints.set(deviceFingerprint, { walletAddress, registeredAt: userData.registeredAt });

    console.log(`✅ User registered successfully: ${walletAddress}`);

    res.json({
      success: true,
      message: 'User registered successfully',
      data: {
        walletAddress,
        registrationId,
        registeredAt: userData.registeredAt,
        verified: true
      }
    });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/user/verify
 * Verify a user's device fingerprint
 */
router.post('/verify', async (req, res) => {
  try {
    // Validate request data
    const { error, value } = verificationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details[0].message
      });
    }

    const { walletAddress, deviceFingerprint } = value;

    console.log(`🔍 Verifying user: ${walletAddress}`);

    // Check if user is registered
    if (!userRegistry.has(walletAddress)) {
      return res.status(404).json({
        success: false,
        error: 'User not registered',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = userRegistry.get(walletAddress);

    // Verify device fingerprint matches
    if (userData.deviceFingerprint !== deviceFingerprint) {
      return res.status(403).json({
        success: false,
        error: 'Device fingerprint mismatch',
        code: 'DEVICE_MISMATCH'
      });
    }

    // Update last activity
    userData.lastActivity = new Date().toISOString();
    userRegistry.set(walletAddress, userData);

    console.log(`✅ User verified successfully: ${walletAddress}`);

    res.json({
      success: true,
      message: 'User verified successfully',
      data: {
        walletAddress,
        verified: true,
        registeredAt: userData.registeredAt,
        lastActivity: userData.lastActivity
      }
    });

  } catch (error) {
    console.error('Error verifying user:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/user/:address
 * Get user registration status
 */
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address'
      });
    }

    console.log(`👤 Checking registration status for ${address}`);

    const userData = userRegistry.get(address);

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: 'User not registered',
        code: 'USER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'User found',
      data: {
        walletAddress: userData.walletAddress,
        registrationId: userData.registrationId,
        registeredAt: userData.registeredAt,
        verified: userData.verified,
        lastActivity: userData.lastActivity
      }
    });

  } catch (error) {
    console.error('Error checking user status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/user/stats/summary
 * Get registration statistics
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const totalUsers = userRegistry.size;
    const totalDevices = deviceFingerprints.size;
    const verifiedUsers = Array.from(userRegistry.values()).filter(user => user.verified).length;

    console.log(`📊 User statistics requested`);

    res.json({
      success: true,
      message: 'User statistics retrieved',
      data: {
        totalUsers,
        totalDevices,
        verifiedUsers,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error retrieving user statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
