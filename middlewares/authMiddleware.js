const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const requireAuth = (req, res, next) => {
  try {
    // Periksa apakah ada token di cookie atau header
    const token = 
      (req.cookies && req.cookies.token) || 
      (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    console.log("Auth middleware - token found:", token ? "Yes" : "No");
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    // Verifikasi token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Validasi userId jika ada
      if (decoded.userId && !mongoose.Types.ObjectId.isValid(decoded.userId)) {
        console.error(`Invalid user ID in token: ${decoded.userId}`);
        return res.status(401).json({
          error: 'InvalidToken',
          message: 'Invalid user ID in token'
        });
      }
      
      // Tambahkan info user ke request
      req.user = {
        userId: decoded.userId || '',
        name: decoded.name || '',
        type: decoded.type || ''
      };
      
      console.log("User authenticated:", req.user);
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'TokenExpired',
          message: 'Session expired, please login again'
        });
      }
      return res.status(401).json({
        error: 'InvalidToken',
        message: 'Invalid authentication token'
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: 'ServerError',
      message: 'Internal server error during authentication'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.type === 'admin') {
    return next();
  }
  return res.status(403).json({
    error: 'Forbidden',
    message: 'Admin access required'
  });
};

const requireLawyerAndAdmin = (req, res, next) => {
  if (req.user && ['admin', 'partner', 'associates', 'paralegal'].includes(req.user.type)) {
    return next();
  }
  return res.status(403).json({
    error: 'Forbidden',
    message: 'Lawyer or admin access required'
  });
};

module.exports = { requireAuth, requireAdmin, requireLawyerAndAdmin };