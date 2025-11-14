const jwt = require('jsonwebtoken');
const Admin = require('../Models/Admin');
const User = require('../Models/User');

// Optional admin check - doesn't fail if not authenticated
exports.optionalAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if admin
        const admin = await Admin.findById(decoded.id);
        if (admin && admin.isApproved) {
          req.isAdmin = true;
          req.adminUser = admin;
          return next();
        }

        // Check if master
        const master = await User.findOne({ _id: decoded.id, role: 'master' });
        if (master) {
          req.isAdmin = true;
          req.adminUser = master;
          return next();
        }
      } catch (err) {
        // Token invalid, continue without admin access
      }
    }

    req.isAdmin = false;
    next();
  } catch (error) {
    req.isAdmin = false;
    next();
  }
};

