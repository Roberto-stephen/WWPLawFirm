const mongoose = require('mongoose');

// Middleware untuk memeriksa admin
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (req.user.type !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required'
    });
  }

  next();
};

// Middleware untuk memeriksa client
const isClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (req.user.type !== 'client') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Client access only'
    });
  }

  next();
};

// Middleware untuk memeriksa lawyer (partner, associates, paralegal)
const isLawyer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  const lawyerTypes = ['partner', 'associates', 'paralegal'];
  if (!lawyerTypes.includes(req.user.type)) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Lawyer access required'
    });
  }

  next();
};

// Middleware untuk memeriksa user ID yang valid
const validateUserId = (req, res, next) => {
  // Ambil ID dari params atau user token
  const userId = req.params.id || req.user.userId;
  
  if (userId && userId !== 'self' && !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({
      error: 'InvalidId',
      message: 'User ID must be a valid MongoDB ObjectId (24 character hex string)'
    });
  }
  
  next();
};

// Middleware untuk memeriksa berbagai peran sekaligus
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.type)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Access restricted to: ${roles.join(', ')}`
      });
    }

    next();
  };
};

module.exports = {
  isAdmin,
  isClient,
  isLawyer,
  validateUserId,
  hasAnyRole
};