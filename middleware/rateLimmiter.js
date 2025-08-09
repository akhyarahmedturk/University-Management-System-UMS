const rateLimit=require('express-rate-limit');

// Strict limiter for login
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 5, // 5 requests per minute
  message: { message: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// General limiter for other routes
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 min
  max: 100, // 100 requests per window
  message: { message: 'Too many requests from this IP. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter, generalLimiter };
