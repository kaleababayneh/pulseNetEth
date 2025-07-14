/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`📡 ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusEmoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
    
    console.log(`${statusEmoji} ${req.method} ${req.originalUrl} - ${status} - ${duration}ms`);
  });
  
  next();
};

/**
 * Rate limiting middleware (simple implementation)
 */
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clean old entries
    for (const [key, value] of requests.entries()) {
      if (now - value.firstRequest > windowMs) {
        requests.delete(key);
      }
    }
    
    // Check rate limit
    const userRequests = requests.get(ip) || { count: 0, firstRequest: now };
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
    }
    
    // Update request count
    userRequests.count++;
    requests.set(ip, userRequests);
    
    next();
  };
};

module.exports = { 
  requestLogger, 
  rateLimiter 
};
