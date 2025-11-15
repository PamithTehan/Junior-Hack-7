import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logout } from '../../store/slices/authSlice';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../../Hooks/useTranslation';
import { 
  FiHome, 
  FiCalendar, 
  FiActivity, 
  FiBookOpen, 
  FiCamera, 
  FiUser, 
  FiLogOut,
  FiMenu,
  FiX,
  FiSettings,
  FiShield,
  FiChevronDown
} from 'react-icons/fi';
import { 
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineBookOpen
} from 'react-icons/hi';
import { 
  MdRestaurant,
  MdDashboard
} from 'react-icons/md';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const { t } = useTranslation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg text-gray-800 dark:text-gray-100 shadow-lg sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-2.5 rounded-xl group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
              <MdRestaurant className="text-white text-2xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent hidden sm:block leading-tight">
                Sri Lankan Nutrition
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Healthy Living Made Simple
              </span>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent sm:hidden">
                SL Nutrition
              </span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/dashboard')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MdDashboard className="text-lg" />
                  <span>{t('nav.dashboard')}</span>
                </Link>
                <Link
                  to="/meal-planner"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/meal-planner')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiCalendar className="text-lg" />
                  <span>{t('nav.mealPlanner')}</span>
                </Link>
                <Link
                  to="/daily-tracker"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/daily-tracker')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiActivity className="text-lg" />
                  <span>{t('nav.dailyTracker')}</span>
                </Link>
                <Link
                  to="/foods"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/foods')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <MdRestaurant className="text-lg" />
                  <span>{t('nav.recipes')}</span>
                </Link>
                <Link
                  to="/awareness"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/awareness')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiOutlineBookOpen className="text-lg" />
                  <span>Awareness</span>
                </Link>
                <Link
                  to="/meet-expert"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/meet-expert')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <HiOutlineUserGroup className="text-lg" />
                  <span>Expert</span>
                </Link>
                <Link
                  to="/scan"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/scan')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiCamera className="text-lg" />
                  <span>{t('nav.scan')}</span>
                </Link>
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <LanguageToggle />
                  <ThemeToggle />
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdminMenuOpen(!adminMenuOpen);
                      }}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {(() => {
                          const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'User');
                          return userName.charAt(0).toUpperCase();
                        })()}
                      </div>
                      <span className="hidden xl:block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {(() => {
                          const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'User');
                          return userName.split(' ')[0];
                        })()}
                      </span>
                      <FiChevronDown className={`text-gray-500 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {adminMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[45]"
                          onClick={() => setAdminMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[50] overflow-hidden">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAdminMenuOpen(false);
                              navigate('/profile');
                            }}
                          >
                            <FiUser className="text-lg" />
                            <span>Profile</span>
                          </Link>
                          <Link
                            to="/admin/login"
                            className="flex items-center space-x-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAdminMenuOpen(false);
                              navigate('/admin/login');
                            }}
                          >
                            <FiShield className="text-lg" />
                            <span>Administration</span>
                          </Link>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAdminMenuOpen(false);
                              handleLogout();
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <FiLogOut className="text-lg" />
                            <span>{t('nav.logout')}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/scan"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive('/scan')
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FiCamera className="text-lg" />
                  <span>{t('nav.scan')}</span>
                </Link>
                <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <LanguageToggle />
                  <ThemeToggle />
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdminMenuOpen(!adminMenuOpen);
                      }}
                      className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      aria-label="Admin menu"
                    >
                      <FiSettings className="text-lg" />
                    </button>
                    {adminMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-[45]"
                          onClick={() => setAdminMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-[50]">
                          <Link
                            to="/admin/login"
                            className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setAdminMenuOpen(false);
                              navigate('/admin/login');
                            }}
                          >
                            <FiShield className="text-lg" />
                            <span>Administration</span>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
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
          <div className="lg:hidden flex items-center space-x-2">
            <LanguageToggle />
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MdDashboard className="text-xl" />
                    <span>{t('nav.dashboard')}</span>
                  </Link>
                  <Link
                    to="/meal-planner"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/meal-planner')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiCalendar className="text-xl" />
                    <span>{t('nav.mealPlanner')}</span>
                  </Link>
                  <Link
                    to="/daily-tracker"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/daily-tracker')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiActivity className="text-xl" />
                    <span>{t('nav.dailyTracker')}</span>
                  </Link>
                  <Link
                    to="/foods"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/foods')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MdRestaurant className="text-xl" />
                    <span>{t('nav.recipes')}</span>
                  </Link>
                  <Link
                    to="/awareness"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/awareness')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiOutlineBookOpen className="text-xl" />
                    <span>Awareness</span>
                  </Link>
                  <Link
                    to="/meet-expert"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/meet-expert')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiOutlineUserGroup className="text-xl" />
                    <span>Expert</span>
                  </Link>
                  <Link
                    to="/scan"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/scan')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiCamera className="text-xl" />
                    <span>{t('nav.scan')}</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link
                    to="/profile"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/profile')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <FiUser className="text-xl" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/admin/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShield className="text-xl" />
                    <span>Administration</span>
                  </Link>
                  {user && (
                    <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg mt-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {(() => {
                          const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'User');
                          return userName.charAt(0).toUpperCase();
                        })()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'User')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mt-2"
                  >
                    <FiLogOut className="text-xl" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/scan"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      isActive('/scan')
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiCamera className="text-xl" />
                    <span>{t('nav.scan')}</span>
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                  <Link
                    to="/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiUser className="text-xl" />
                    <span>{t('nav.login')}</span>
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HiOutlineSparkles className="text-xl" />
                    <span>{t('nav.register')}</span>
                  </Link>
                  <Link
                    to="/admin/login"
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <FiShield className="text-xl" />
                    <span>Administration</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

