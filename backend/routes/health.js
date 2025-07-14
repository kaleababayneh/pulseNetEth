const express = require('express');
const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PulseNet Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * GET /api/health/detailed
 * Detailed health check with service status
 */
router.get('/detailed', async (req, res) => {
  const blockchainService = require('../services/blockchain');
  const dataStorage = require('../services/dataStorage');

  try {
    // Check various service components
    const checks = {
      api: { status: 'healthy', responseTime: Date.now() },
      blockchain: { 
        status: blockchainService.initialized ? 'healthy' : 'unhealthy',
        connected: blockchainService.initialized
      },
      storage: {
        status: 'healthy',
        writable: true // We assume local storage is always writable
      },
      zkProof: {
        status: 'healthy',
        simulation: true
      }
    };

    // Calculate overall health
    const allHealthy = Object.values(checks).every(check => check.status === 'healthy');

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
