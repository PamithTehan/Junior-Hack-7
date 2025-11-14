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
    // Extract and normalize input data (handle both JSON and FormData)
    // FormData fields come as strings, JSON fields come as typed values
    const {
      firstName = '',
      lastName = '',
      email = '',
      password = '',
      dateOfBirth = '',
      height = null,
      weight = null,
      gender = '',
      diabetes = '',
      cholesterol = '',
      otherMedicalStatus = '',
      dietaryPreferences = null,
    } = req.body;

    // Normalize string fields
    const normalizedData = {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: String(email).trim().toLowerCase(),
      password: String(password),
      dateOfBirth: String(dateOfBirth).trim(),
      height: height ? parseFloat(String(height)) : null,
      weight: weight ? parseFloat(String(weight)) : null,
      gender: String(gender).trim().toLowerCase(),
      diabetes: String(diabetes).toLowerCase() === 'yes',
      cholesterol: String(cholesterol).toLowerCase() === 'yes',
      otherMedicalStatus: String(otherMedicalStatus || '').trim(),
    };

    // Validate required fields
    const requiredFields = [
      { field: 'firstName', value: normalizedData.firstName, label: 'First Name' },
      { field: 'lastName', value: normalizedData.lastName, label: 'Last Name' },
      { field: 'email', value: normalizedData.email, label: 'Email' },
      { field: 'password', value: normalizedData.password, label: 'Password' },
      { field: 'dateOfBirth', value: normalizedData.dateOfBirth, label: 'Date of Birth' },
      { field: 'height', value: normalizedData.height, label: 'Height' },
      { field: 'weight', value: normalizedData.weight, label: 'Weight' },
      { field: 'gender', value: normalizedData.gender, label: 'Gender' },
    ];

    const missingFields = requiredFields
      .filter(({ value }) => !value || value === '')
      .map(({ label }) => label);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedData.email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Validate password length
    if (normalizedData.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(normalizedData.gender)) {
      return res.status(400).json({
        success: false,
        message: `Gender must be one of: ${validGenders.join(', ')}`,
      });
    }

    // Validate height
    if (isNaN(normalizedData.height) || normalizedData.height < 50 || normalizedData.height > 300) {
      return res.status(400).json({
        success: false,
        message: 'Height must be a number between 50 and 300 cm',
      });
    }

    // Validate weight
    if (isNaN(normalizedData.weight) || normalizedData.weight < 1 || normalizedData.weight > 500) {
      return res.status(400).json({
        success: false,
        message: 'Weight must be a number between 1 and 500 kg',
      });
    }

    // Validate date of birth
    const dateOfBirthObj = new Date(normalizedData.dateOfBirth);
    if (isNaN(dateOfBirthObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date of birth',
      });
    }

    // Check if date is in the future
    if (dateOfBirthObj > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Date of birth cannot be in the future',
      });
    }

    // Check if user already exists (email is already normalized to lowercase)
    const existingUser = await User.findOne({ email: normalizedData.email });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'This email address is already registered.',
        error: {
          field: 'email',
          value: normalizedData.email,
          code: 'EMAIL_ALREADY_EXISTS',
          suggestion: 'Please use a different email address or try logging in if this is your account.',
        },
      });
    }

    // Process dietary preferences
    let processedDietaryPrefs = [];
    if (dietaryPreferences) {
      try {
        if (typeof dietaryPreferences === 'string') {
          processedDietaryPrefs = JSON.parse(dietaryPreferences);
        } else if (Array.isArray(dietaryPreferences)) {
          processedDietaryPrefs = dietaryPreferences.filter(p => p);
        }
      } catch (e) {
        processedDietaryPrefs = [];
      }
    }

    // Process medical reports (file uploads)
    const medicalReports = [];
    if (req.files && req.files.length > 0) {
      const { uploadToCloudinary } = require('../Config/cloudinary');
      
      for (const file of req.files) {
        try {
          const isPdf = file.mimetype === 'application/pdf';
          const uploadResult = await uploadToCloudinary(
            file.buffer,
            'sri-lankan-nutrition/medical-reports',
            { resourceType: isPdf ? 'raw' : 'image' }
          );
          
          medicalReports.push({
            url: uploadResult.secure_url,
            cloudinaryId: uploadResult.public_id,
            fileName: file.originalname,
            fileType: isPdf ? 'pdf' : 'image',
            uploadedAt: new Date(),
          });
        } catch (uploadError) {
          console.error(`Error uploading file ${file.originalname}:`, uploadError.message);
          // Continue with registration even if file upload fails
        }
      }
    }

    // Create user
    const userData = {
      firstName: normalizedData.firstName,
      lastName: normalizedData.lastName,
      email: normalizedData.email, // Already normalized to lowercase
      password: normalizedData.password,
      dateOfBirth: dateOfBirthObj,
      gender: normalizedData.gender,
      diabetes: normalizedData.diabetes,
      cholesterol: normalizedData.cholesterol,
      otherMedicalStatus: normalizedData.otherMedicalStatus,
      dietaryPreferences: processedDietaryPrefs,
      medicalReports,
      healthProfile: {
        height: normalizedData.height,
        weight: normalizedData.weight,
        // Age and BMI will be calculated automatically in the pre-save hook
      },
    };

    const user = await User.create(userData);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully. Please login to continue.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

  } catch (error) {
    // Handle MongoDB validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors,
      });
    }

    // Handle duplicate key errors (specific field error messages)
    if (error.code === 11000) {
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
      const duplicateValue = error.keyValue ? error.keyValue[duplicateField] : 'value';
      
      // Specific error messages for different duplicate fields
      const errorMessages = {
        email: {
          message: 'This email address is already registered.',
          suggestion: 'Please use a different email address or try logging in if this is your account.',
        },
        userId: {
          message: 'A user with this ID already exists.',
          suggestion: 'Please try again. The system will generate a new user ID.',
        },
      };

      const fieldError = errorMessages[duplicateField] || {
        message: `A record with this ${duplicateField} already exists.`,
        suggestion: `Please use a different ${duplicateField}.`,
      };

      console.error(`Duplicate ${duplicateField} error:`, duplicateValue);
      
      return res.status(400).json({
        success: false,
        message: fieldError.message,
        error: {
          field: duplicateField,
          value: duplicateValue,
          code: 'DUPLICATE_ENTRY',
          suggestion: fieldError.suggestion,
        },
      });
    }

    // Handle other errors
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
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

