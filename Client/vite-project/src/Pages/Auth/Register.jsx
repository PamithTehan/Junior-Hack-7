import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError, checkEmailAvailability } from '../../store/slices/authSlice';
import { useTranslation } from '../../Hooks/useTranslation';
import {
  GENDER_OPTIONS,
  YES_NO_OPTIONS,
  DIETARY_PREFERENCE_OPTIONS,
} from '../../constants/formOptions';
import { generateUniqueEmail } from '../../utils/testHelpers';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { register: registerForm, handleSubmit, formState: { errors }, watch, getValues } = useForm();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [medicalReports, setMedicalReports] = useState([]);
  const [showOtherMedical, setShowOtherMedical] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [emailAvailability, setEmailAvailability] = useState(null); // null, 'checking', 'available', 'taken'
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  // Watch email field for real-time availability checking
  const watchedEmail = watch('email');

  // Real-time email availability check with debounce
  useEffect(() => {
    // Clear previous timeout
    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    // Validate email format before checking
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!watchedEmail || !emailRegex.test(watchedEmail.trim())) {
      setEmailAvailability(null);
      return;
    }

    // Set checking state
    setEmailAvailability('checking');

    // Debounce email check (wait 800ms after user stops typing)
    const timeout = setTimeout(async () => {
      try {
        const result = await dispatch(checkEmailAvailability(watchedEmail.trim())).unwrap();
        setEmailAvailability(result.available ? 'available' : 'taken');
      } catch (error) {
        console.error('Email check error:', error);
        setEmailAvailability(null);
      }
    }, 800);

    setEmailCheckTimeout(timeout);

    // Cleanup
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [watchedEmail, dispatch]);

  // Clear email availability when error is cleared
  useEffect(() => {
    if (!error) {
      setEmailAvailability(null);
    }
  }, [error]);

  // Watch for otherMedical dropdown
  const handleOtherMedicalChange = (value) => {
    setShowOtherMedical(value === 'yes');
    if (value !== 'yes') {
      registerForm('otherMedicalStatus', { value: '' });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setMedicalReports(files);
  };

  const onStep1Submit = (data) => {
    // Validate step 1 data
    if (!data.firstName || !data.lastName || !data.email || !data.dateOfBirth || !data.height || !data.weight || !data.gender || !data.password) {
      return;
    }
    setStep(2);
  };

  const onStep2Submit = async (data) => {
    // Clear any previous errors
    dispatch(clearError());
    
    // Get all form values (both step 1 and step 2)
    const allFormData = getValues();
    
    // Validate that all required fields from step 1 are present
    if (!allFormData.firstName || !allFormData.lastName || !allFormData.email || 
        !allFormData.password || !allFormData.dateOfBirth || !allFormData.height || 
        !allFormData.weight || !allFormData.gender) {
      dispatch(clearError());
      // Go back to step 1 if required fields are missing
      setStep(1);
      return;
    }
    
    // Clear error before attempting registration
    dispatch(clearError());
    
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all form fields from both steps
    formData.append('firstName', allFormData.firstName.trim());
    formData.append('lastName', allFormData.lastName.trim());
    formData.append('email', allFormData.email.trim().toLowerCase());
    formData.append('password', allFormData.password);
    formData.append('dateOfBirth', allFormData.dateOfBirth);
    formData.append('height', String(allFormData.height));
    formData.append('weight', String(allFormData.weight));
    formData.append('gender', allFormData.gender);
    
    // Handle diabetes and cholesterol - send 'yes' or empty string
    formData.append('diabetes', allFormData.diabetes === 'yes' ? 'yes' : '');
    formData.append('cholesterol', allFormData.cholesterol === 'yes' ? 'yes' : '');
    formData.append('otherMedicalStatus', allFormData.otherMedicalStatus || '');

    // Add dietary preferences
    const dietaryPreferences = [];
    if (allFormData.dietaryPreferences?.vegan === 'yes') dietaryPreferences.push('vegan');
    if (allFormData.dietaryPreferences?.vegetarian === 'yes') dietaryPreferences.push('vegetarian');
    if (allFormData.dietaryPreferences?.nonVegetarian === 'yes') dietaryPreferences.push('non-vegetarian');
    // Send as array
    if (dietaryPreferences.length > 0) {
      formData.append('dietaryPreferences', JSON.stringify(dietaryPreferences));
    }

    // Add medical report files
    medicalReports.forEach((file) => {
      formData.append('medicalReports', file);
    });

    try {
      const result = await dispatch(register(formData));
      
      if (result.type === 'auth/register/fulfilled') {
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else if (result.type === 'auth/register/rejected') {
        // Error is already set in the Redux state, will be displayed automatically
        console.error('Registration failed:', result.payload);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your account has been created successfully. You will be redirected to the login page shortly.
          </p>
          <Link
            to="/login"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🍛</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            {t('auth.createAccount')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Step {step} of 2
          </p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className={`h-2 w-12 rounded ${step === 1 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`h-2 w-12 rounded ${step === 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 animate-fade-in">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="font-semibold mb-1">Registration Error</p>
                <p className="text-sm">{error}</p>
                {(error.includes('already exists') || error.includes('already registered')) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs">
                      This email address is already in use. Please choose a different email or{' '}
                      <Link to="/login" className="underline font-semibold hover:text-red-800 dark:hover:text-red-300">
                        login here
                      </Link>
                      {' '}if this is your account.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        dispatch(clearError());
                        setStep(1);
                        // Generate a unique email for testing
                        if (process.env.NODE_ENV === 'development') {
                          const uniqueEmail = generateUniqueEmail();
                          registerForm('email', { value: uniqueEmail });
                        }
                      }}
                      className="text-xs underline hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      {process.env.NODE_ENV === 'development' ? 'Use unique test email' : 'Go back and change email'}
                    </button>
                  </div>
                )}
                {error.includes('Validation failed') && (
                  <p className="text-xs mt-2">
                    Please check all fields and ensure they meet the requirements.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dispatch(clearError())}
                className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                aria-label="Close error"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerForm('firstName', {
                    required: 'First name is required',
                  })}
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerForm('lastName', {
                    required: 'Last name is required',
                  })}
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...registerForm('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Invalid email address',
                    },
                    onChange: () => {
                      // Clear error when user changes email
                      if (error && (error.includes('already exists') || error.includes('already registered'))) {
                        dispatch(clearError());
                      }
                      setEmailAvailability(null);
                    },
                  })}
                  type="email"
                  id="email"
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${
                    emailAvailability === 'available'
                      ? 'border-green-500 dark:border-green-600'
                      : emailAvailability === 'taken'
                      ? 'border-red-500 dark:border-red-600'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                  placeholder="Enter your email"
                />
                {/* Email availability indicator */}
                {watchedEmail && watchedEmail.trim() && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {emailAvailability === 'checking' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-500"></div>
                    )}
                    {emailAvailability === 'available' && (
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {emailAvailability === 'taken' && (
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
              {/* Email validation messages */}
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
              {emailAvailability === 'available' && !errors.email && (
                <p className="mt-1 text-sm text-green-600">✓ This email is available</p>
              )}
              {emailAvailability === 'taken' && !errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  ✗ This email is already registered. Please use a different email or{' '}
                  <Link to="/login" className="underline font-semibold">
                    login here
                  </Link>
                </p>
              )}
              {/* Test helper button (development only) */}
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={() => {
                    const uniqueEmail = generateUniqueEmail();
                    registerForm('email', { value: uniqueEmail });
                  }}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Generate Unique Test Email
                </button>
              )}
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                {...registerForm('dateOfBirth', {
                  required: 'Date of birth is required',
                })}
                type="date"
                id="dateOfBirth"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerForm('height', {
                    required: 'Height is required',
                    min: { value: 50, message: 'Height must be at least 50 cm' },
                    max: { value: 250, message: 'Height must be less than 250 cm' },
                  })}
                  type="number"
                  id="height"
                  min="50"
                  max="250"
                  step="0.1"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Height in cm"
                />
                {errors.height && (
                  <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  {...registerForm('weight', {
                    required: 'Weight is required',
                    min: { value: 1, message: 'Weight must be at least 1 kg' },
                    max: { value: 500, message: 'Weight must be less than 500 kg' },
                  })}
                  type="number"
                  id="weight"
                  min="1"
                  max="500"
                  step="0.1"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Weight in kg"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                {...registerForm('gender', {
                  required: 'Gender is required',
                })}
                id="gender"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                {...registerForm('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type="password"
                id="password"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dietary Preferences
              </label>
              <div className="space-y-3">
                {DIETARY_PREFERENCE_OPTIONS.map((pref) => {
                  const fieldKey = pref.value === 'non-vegetarian' ? 'nonVegetarian' : pref.value;
                  return (
                    <div key={pref.value}>
                      <label 
                        htmlFor={`dietaryPreferences.${fieldKey}`} 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {pref.label}
                      </label>
                      <select
                        {...registerForm(`dietaryPreferences.${fieldKey}`)}
                        id={`dietaryPreferences.${fieldKey}`}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      >
                        {YES_NO_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onStep2Submit)} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Medical Information
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="diabetes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Do you have Diabetes?
                </label>
                <select
                  {...registerForm('diabetes')}
                  id="diabetes"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cholesterol" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Do you have Cholesterol issues?
                </label>
                <select
                  {...registerForm('cholesterol')}
                  id="cholesterol"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="otherMedical" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Other medical conditions
                </label>
                <select
                  {...registerForm('otherMedical')}
                  id="otherMedical"
                  onChange={(e) => handleOtherMedicalChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                >
                  {YES_NO_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {showOtherMedical && (
              <div>
                <label htmlFor="otherMedicalStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please specify other medical conditions
                </label>
                <textarea
                  {...registerForm('otherMedicalStatus')}
                  id="otherMedicalStatus"
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  placeholder="Describe your medical conditions..."
                />
              </div>
            )}

            <div>
              <label htmlFor="medicalReports" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Medical Reports (PDF or Images)
              </label>
              <input
                type="file"
                id="medicalReports"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
              {medicalReports.length > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {medicalReports.length} file(s) selected
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                You can upload multiple files (PDF, JPG, PNG, WEBP)
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 py-3 rounded-xl font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('auth.haveAccount')}{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-semibold">
              {t('auth.loginHere')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
