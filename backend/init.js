const blockchainService = require('./services/blockchain');

async function initializeBackend() {
  console.log('🔧 Initializing PulseNet Backend...');
  
  try {
    // Initialize blockchain service
    const initialized = await blockchainService.initialize();
    
    if (initialized) {
      console.log('✅ Blockchain service initialized successfully');
    } else {
      console.log('⚠️  Blockchain service initialization failed - continuing without contracts');
    }
    
    console.log('🚀 Backend initialization complete');
    return true;
    
  } catch (error) {
    console.error('❌ Backend initialization failed:', error.message);
    return false;
  }
}

// Auto-initialize when the module is required
initializeBackend();

module.exports = initializeBackend;
