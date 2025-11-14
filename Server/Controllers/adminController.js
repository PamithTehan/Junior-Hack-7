const Admin = require('../Models/Admin');
const User = require('../Models/User');
const FoodItem = require('../Models/FoodItem');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register admin
// @route   POST /api/admin/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide first name, last name, email, and password',
      });
    }

    // Check if admin exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists with this email',
      });
    }

    // Create admin (not approved yet)
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      password,
      isApproved: false,
    });

    res.status(201).json({
      success: true,
      message: 'Admin registration successful! Please wait for master approval.',
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        adminId: admin.adminId,
        isApproved: admin.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering admin',
      error: error.message,
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // First check if it's a master user
    const master = await User.findOne({ email, role: 'master' }).select('+password');
    if (master) {
      console.log('Master user found, checking password...');
      const isMatch = await master.comparePassword(password);
      if (!isMatch) {
        console.log('Master password mismatch');
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      console.log('Master login successful');
      // Generate token
      const token = generateToken(master._id);

      return res.status(200).json({
        success: true,
        token,
        admin: {
          id: master._id,
          firstName: master.firstName,
          lastName: master.lastName,
          email: master.email,
          adminId: master.userId || 'MS-0001',
          role: 'master',
        },
      });
    }

    console.log('No master user found, checking admin...');

    // Check for admin and include password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      console.log(`Admin not found for email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    console.log(`Admin found: ${admin.email}, Approved: ${admin.isApproved}`);

    // Check if admin is approved
    if (!admin.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Wait for Administration Response',
      });
    }

    // Check if password matches
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        adminId: admin.adminId,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private (Admin/Master)
exports.getMe = async (req, res) => {
  try {
    // If it's a master user, req.admin is already set by middleware
    if (req.admin.role === 'master') {
      return res.status(200).json({
        success: true,
        admin: {
          id: req.admin.id,
          firstName: req.admin.firstName,
          lastName: req.admin.lastName,
          email: req.admin.email,
          adminId: req.admin.adminId || 'MS-0001',
          role: 'master',
        },
      });
    }

    // Otherwise, it's a regular admin
    const admin = await Admin.findById(req.admin.id || req.admin._id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    res.status(200).json({
      success: true,
      admin: {
        id: admin._id,
        firstName: admin.firstName,
        lastName: admin.lastName,
        email: admin.email,
        adminId: admin.adminId,
        role: admin.role || 'admin',
        isApproved: admin.isApproved,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message,
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin/Master)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFoods = await FoodItem.countDocuments();
    const totalRecipes = await FoodItem.countDocuments({ isTraditional: true, description: { $exists: true, $ne: '' } });
    const pendingApprovals = await Admin.countDocuments({ isApproved: false });
    const pendingRecipes = await FoodItem.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFoods,
        totalRecipes,
        pendingApprovals,
        pendingRecipes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin/Master)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin/Master)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Prevent deleting master user (site owner)
    if (user.role === 'master') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete master user (site owner)',
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
};

// @desc    Get pending admin approvals
// @route   GET /api/admin/pending-admins
// @access  Private (Master only)
exports.getPendingAdmins = async (req, res) => {
  try {
    if (req.admin.role !== 'master') {
      return res.status(403).json({
        success: false,
        message: 'Only master can view pending admins',
      });
    }

    const pendingAdmins = await Admin.find({ isApproved: false }).select('-password');
    res.status(200).json({
      success: true,
      data: pendingAdmins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending admins',
      error: error.message,
    });
  }
};

// @desc    Get all admins (approved and pending)
// @route   GET /api/admin/all-admins
// @access  Private (Master only)
exports.getAllAdmins = async (req, res) => {
  try {
    if (req.admin.role !== 'master') {
      return res.status(403).json({
        success: false,
        message: 'Only master can view all admins',
      });
    }

    const allAdmins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: allAdmins,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching all admins',
      error: error.message,
    });
  }
};

// @desc    Approve admin
// @route   PUT /api/admin/approve/:id
// @access  Private (Master only)
exports.approveAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'master') {
      return res.status(403).json({
        success: false,
        message: 'Only master can approve admins',
      });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    admin.isApproved = true;
    admin.approvedBy = req.admin.id;
    admin.approvedAt = new Date();
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Admin approved successfully',
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving admin',
      error: error.message,
    });
  }
};

// @desc    Remove admin
// @route   DELETE /api/admin/:id
// @access  Private (Master only)
exports.removeAdmin = async (req, res) => {
  try {
    if (req.admin.role !== 'master') {
      return res.status(403).json({
        success: false,
        message: 'Only master can remove admins',
      });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    await Admin.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Admin removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error removing admin',
      error: error.message,
    });
  }
};

// @desc    Approve recipe
// @route   PUT /api/admin/recipes/:id/approve
// @access  Private (Admin/Master)
exports.approveRecipe = async (req, res) => {
  try {
    const food = await FoodItem.findById(req.params.id);
    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food/Recipe not found',
      });
    }

    food.isApproved = true;
    food.approvedBy = req.admin.id;
    food.approvedAt = new Date();
    await food.save();

    res.status(200).json({
      success: true,
      message: 'Recipe approved successfully',
      data: food,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving recipe',
      error: error.message,
    });
  }
};

