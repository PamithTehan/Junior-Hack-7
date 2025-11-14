const jwt = require('jsonwebtoken');
const User = require('../Models/User');
const Admin = require('../Models/Admin');

// Protect routes (supports both User and Admin authentication)
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // First check if it's a User
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
        return next();
      }

      // Check if it's an Admin
      const admin = await Admin.findById(decoded.id);
      if (admin && admin.isApproved) {
        // Set req.user for compatibility with authorize middleware
        req.user = {
          _id: admin._id,
          role: admin.role || 'admin',
          id: admin._id,
        };
        req.admin = admin; // Also set req.admin for admin-specific routes
        return next();
      }

      // Check if it's a master user
      const master = await User.findOne({ _id: decoded.id, role: 'master' });
      if (master) {
        req.user = master;
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Grant access to specific roles (supports both User and Admin)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user has required role
    const userRole = req.user?.role;
    
    // Admin and master are always authorized for 'admin' role
    if (roles.includes('admin') && (userRole === 'admin' || userRole === 'master')) {
      return next();
    }
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole || 'unknown'}' is not authorized to access this route`,
      });
    }
    next();
  };
};

