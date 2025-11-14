const User = require('../Models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      age,
      gender,
      diabetes,
      cholesterol,
      otherMedicalStatus,
      dietaryPreferences,
    } = req.body;

    // Validation - mandatory fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !age || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, dateOfBirth, age, and gender',
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Handle file uploads (medical reports)
    const medicalReports = [];
    if (req.files && req.files.length > 0) {
      const { uploadToCloudinary } = require('../Config/cloudinary');
      
      for (const file of req.files) {
        try {
          const isPdf = file.mimetype === 'application/pdf';
          const result = await uploadToCloudinary(
            file.buffer,
            'sri-lankan-nutrition/medical-reports',
            { resourceType: isPdf ? 'raw' : 'image' }
          );
          
          medicalReports.push({
            url: result.secure_url,
            cloudinaryId: result.public_id,
            fileName: file.originalname,
            fileType: isPdf ? 'pdf' : 'image',
          });
        } catch (uploadError) {
          console.error('Error uploading medical report:', uploadError);
          // Continue with other files even if one fails
        }
      }
    }

    // Handle dietary preferences
    let dietaryPrefs = [];
    if (dietaryPreferences) {
      try {
        // Try parsing as JSON string first
        if (typeof dietaryPreferences === 'string') {
          dietaryPrefs = JSON.parse(dietaryPreferences);
        } else if (Array.isArray(dietaryPreferences)) {
          dietaryPrefs = dietaryPreferences.filter(p => p);
        } else if (typeof dietaryPreferences === 'object') {
          dietaryPrefs = Object.values(dietaryPreferences).filter(p => p);
        }
      } catch (e) {
        // If parsing fails, treat as single value
        dietaryPrefs = [dietaryPreferences];
      }
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      dateOfBirth: new Date(dateOfBirth),
      age: parseInt(age),
      gender,
      diabetes: diabetes === true || diabetes === 'true',
      cholesterol: cholesterol === true || cholesterol === 'true',
      otherMedicalStatus: otherMedicalStatus || '',
      dietaryPreferences: dietaryPrefs,
      medicalReports,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login to continue.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
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

    // Check for user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        healthProfile: user.healthProfile,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
};

// @desc    Update user health profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, healthProfile } = req.body;
    const fieldsToUpdate = {};

    if (name) fieldsToUpdate.name = name;
    if (healthProfile) fieldsToUpdate.healthProfile = healthProfile;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    // Calculate daily calorie goal if needed
    if (healthProfile && (healthProfile.weight || healthProfile.height || healthProfile.age)) {
      // Harris-Benedict equation for calorie calculation
      const heightInMeters = user.healthProfile.height / 100;
      let bmr;
      
      // Assuming male calculation (can be enhanced with gender)
      if (user.healthProfile.age && user.healthProfile.weight && user.healthProfile.height) {
        bmr = 88.362 + (13.397 * user.healthProfile.weight) + 
              (4.799 * user.healthProfile.height) - 
              (5.677 * user.healthProfile.age);
        
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };
        
        const multiplier = activityMultipliers[user.healthProfile.activityLevel] || 1.2;
        user.healthProfile.dailyCalorieGoal = Math.round(bmr * multiplier);
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message,
    });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

