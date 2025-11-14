import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogin, clearError } from '../../store/slices/adminSlice';

const AdminLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.admin);
  const { register: registerForm, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const result = await dispatch(adminLogin(data));
    if (result.type === 'admin/login/fulfilled') {
      navigate('/admin/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👨‍💼</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-2">
            Admin Login
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Login to administration panel
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
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
              Password
            </label>
            <input
              {...registerForm('password', {
                required: 'Password is required',
              })}
              type="password"
              id="password"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all outline-none bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              placeholder="Enter your password"
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
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an admin account?{' '}
            <Link to="/admin/signup" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-500 font-semibold">
              Sign up here
            </Link>
          </p>
          <Link
            to="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

