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
    // Log incoming request for debugging
    console.log('Registration request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files:', req.files ? req.files.length : 0);
    
    // Parse FormData fields (all come as strings when using FormData)
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    const dateOfBirth = req.body.dateOfBirth;
    const height = req.body.height ? parseFloat(req.body.height) : null;
    const weight = req.body.weight ? parseFloat(req.body.weight) : null;
    const gender = req.body.gender;
    // Parse diabetes and cholesterol (FormData sends booleans as strings 'true'/'false')
    // Also handle 'yes' string from dropdown
    const diabetes = req.body.diabetes === 'yes' || req.body.diabetes === 'true' || req.body.diabetes === true || req.body.diabetes === 'Yes';
    const cholesterol = req.body.cholesterol === 'yes' || req.body.cholesterol === 'true' || req.body.cholesterol === true || req.body.cholesterol === 'Yes';
    const otherMedicalStatus = req.body.otherMedicalStatus || '';
    const dietaryPreferences = req.body.dietaryPreferences;

    // Validation - mandatory fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !height || !weight || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, dateOfBirth, height, weight, and gender',
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

    // Validate required fields again after parsing
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !height || !weight || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, password, dateOfBirth, height, weight, and gender',
        debug: {
          firstName: !!firstName,
          lastName: !!lastName,
          email: !!email,
          password: !!password,
          dateOfBirth: !!dateOfBirth,
          height,
          weight,
          gender: !!gender,
        },
      });
    }

    // Validate height and weight are valid numbers
    if (isNaN(height) || height <= 0 || height > 300) {
      return res.status(400).json({
        success: false,
        message: 'Height must be a valid number between 1 and 300 cm',
      });
    }

    if (isNaN(weight) || weight <= 0 || weight > 1000) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a valid number between 1 and 1000 kg',
      });
    }

    // Validate date of birth
    const dateOfBirthObj = new Date(dateOfBirth);
    if (isNaN(dateOfBirthObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date of birth',
      });
    }

    // Create user with health profile (height, weight will calculate BMI automatically)
    let user;
    try {
      user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        dateOfBirth: dateOfBirthObj,
        gender,
        diabetes,
        cholesterol,
        otherMedicalStatus: otherMedicalStatus ? otherMedicalStatus.trim() : '',
        dietaryPreferences: dietaryPrefs,
        medicalReports,
        healthProfile: {
          height,
          weight,
          // Age and BMI will be calculated in the pre-save hook
        },
      });
    } catch (createError) {
      console.error('Error creating user:', createError);
      console.error('User creation error details:', {
        name: createError.name,
        message: createError.message,
        errors: createError.errors,
      });
      throw createError; // Re-throw to be caught by outer try-catch
    }

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
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

    // Age is recalculated in pre-save hook, but we need it for calorie calculation
    // Ensure age is up-to-date before calculating calories
    if (user.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(user.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      user.healthProfile.age = age;
    }

    // Calculate daily calorie goal if needed
    if (healthProfile && (healthProfile.weight || healthProfile.height)) {
      // Harris-Benedict equation for calorie calculation
      const heightInMeters = user.healthProfile.height / 100;
      let bmr;
      
      // Use calculated age for calorie calculation
      if (user.healthProfile.age && user.healthProfile.weight && user.healthProfile.height) {
        // Different BMR formulas for male and female
        if (user.gender === 'female') {
          bmr = 447.593 + (9.247 * user.healthProfile.weight) + 
                (3.098 * user.healthProfile.height) - 
                (4.330 * user.healthProfile.age);
        } else {
          // Male or other
          bmr = 88.362 + (13.397 * user.healthProfile.weight) + 
                (4.799 * user.healthProfile.height) - 
                (5.677 * user.healthProfile.age);
        }
        
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

