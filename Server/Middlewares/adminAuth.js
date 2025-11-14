const jwt = require('jsonwebtoken');
const Admin = require('../Models/Admin');
const User = require('../Models/User');

// Protect admin routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
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

      // Check if admin exists and is approved
      const admin = await Admin.findById(decoded.id);
      if (admin && admin.isApproved) {
        req.admin = admin;
        return next();
      }

      // Check if master user exists
      const master = await User.findOne({ _id: decoded.id, role: 'master' });
      if (master) {
        req.admin = {
          id: master._id,
          role: 'master',
          firstName: master.firstName,
          lastName: master.lastName,
          email: master.email,
          adminId: master.userId || 'MS-0001',
        };
        return next();
      }

      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error in authentication',
      error: error.message,
    });
  }
};

