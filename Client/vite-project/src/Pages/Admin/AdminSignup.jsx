import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { adminRegister, clearError } from '../../store/slices/adminSlice';

const AdminSignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();
  const [signupSuccess, setSignupSuccess] = useState(false);

  const onSubmit = async (data) => {
    const result = await dispatch(adminRegister(data));
    if (result.type === 'admin/register/fulfilled') {
      setSignupSuccess(true);
      setTimeout(() => {
        navigate('/admin/login', { replace: true });
      }, 3000);
    }
  };

  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 text-center">
          <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Registration Successful!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your admin account has been created. Please wait for master approval. You will be redirected to the login page shortly.
          </p>
          <Link
            to="/admin/login"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go to Admin Login
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
            <span className="text-3xl">👨‍💼</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Admin Signup
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create an admin account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...registerForm('firstName', { required: 'First name is required' })}
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
                {...registerForm('lastName', { required: 'Last name is required' })}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-xl font-bold hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Creating Account...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Already have an admin account?{' '}
            <Link to="/admin/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-semibold">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;

