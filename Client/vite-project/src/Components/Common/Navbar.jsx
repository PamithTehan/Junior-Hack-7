import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../../Hooks/useTranslation';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
              <span className="text-2xl">🍛</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:block">
              Sri Lankan Nutrition
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent sm:hidden">
              SL Nutrition
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.dashboard')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/meal-planner"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.mealPlanner')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/tracker"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.tracker')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/recipes"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.recipes')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/awareness"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Awareness
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/meet-expert"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meet an EXPERT
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/scan"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.scan')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <div className="flex items-center space-x-3">
                  <LanguageToggle />
                  <ThemeToggle />
                  <div className="hidden lg:flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hi, {user?.name?.split(' ')[0]}</span>
                  </div>
                  {/* Admin Menu Button */}
                  <div className="relative">
                    <button
                      onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                      className="text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Admin menu"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    {adminMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <Link
                          to="/admin/login"
                          className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setAdminMenuOpen(false)}
                        >
                          Administration
                        </Link>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm md:text-base"
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <LanguageToggle />
                <ThemeToggle />
                {/* Admin Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className="text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    aria-label="Admin menu"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  {adminMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <Link
                        to="/admin/login"
                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setAdminMenuOpen(false)}
                      >
                        Administration
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/scan"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors relative group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.scan')}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 dark:bg-primary-400 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-6 py-2 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.dashboard')}
                  </Link>
                  <Link
                    to="/meal-planner"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.mealPlanner')}
                  </Link>
                  <Link
                    to="/tracker"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.tracker')}
                  </Link>
                  <Link
                    to="/recipes"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.recipes')}
                  </Link>
                  <Link
                    to="/awareness"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Awareness
                  </Link>
                  <Link
                    to="/meet-expert"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Meet an EXPERT
                  </Link>
                  <Link
                    to="/scan"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.scan')}
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.profile')}
                  </Link>
                  <Link
                    to="/admin/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                  {user && (
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mt-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/scan"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.scan')}
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.register')}
                  </Link>
                  <Link
                    to="/admin/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Close admin menu when clicking outside */}
      {adminMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setAdminMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;

