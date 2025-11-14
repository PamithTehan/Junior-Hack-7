import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../../store/slices/authSlice';
import { useTranslation } from '../../Hooks/useTranslation';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { register: registerForm, handleSubmit, formState: { errors }, watch } = useForm();
  const { t } = useTranslation();
  
  const [step, setStep] = useState(1);
  const [medicalReports, setMedicalReports] = useState([]);
  const [showOtherMedical, setShowOtherMedical] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all form fields
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('height', data.height);
    formData.append('weight', data.weight);
    formData.append('gender', data.gender);
    formData.append('diabetes', data.diabetes === 'yes' || false);
    formData.append('cholesterol', data.cholesterol === 'yes' || false);
    formData.append('otherMedicalStatus', data.otherMedicalStatus || '');

    // Add dietary preferences
    const dietaryPreferences = [];
    if (data.dietaryPreferences?.vegan === 'yes') dietaryPreferences.push('vegan');
    if (data.dietaryPreferences?.vegetarian === 'yes') dietaryPreferences.push('vegetarian');
    if (data.dietaryPreferences?.nonVegetarian === 'yes') dietaryPreferences.push('non-vegetarian');
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
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
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
              <input
                {...registerForm('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email address',
                  },
                })}
                type="email"
                id="email"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
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
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
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
                <div>
                  <label htmlFor="dietaryPreferences.vegan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vegan
                  </label>
                  <select
                    {...registerForm('dietaryPreferences.vegan')}
                    id="dietaryPreferences.vegan"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dietaryPreferences.vegetarian" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Vegetarian
                  </label>
                  <select
                    {...registerForm('dietaryPreferences.vegetarian')}
                    id="dietaryPreferences.vegetarian"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="dietaryPreferences.nonVegetarian" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Non-Vegetarian
                  </label>
                  <select
                    {...registerForm('dietaryPreferences.nonVegetarian')}
                    id="dietaryPreferences.nonVegetarian"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
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
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
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
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
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
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
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
