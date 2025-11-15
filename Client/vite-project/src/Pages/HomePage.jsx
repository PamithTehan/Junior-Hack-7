import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../Hooks/useTranslation';
import { 
  FiBarChart2, 
  FiCalendar, 
  FiActivity, 
  FiArrowRight
} from 'react-icons/fi';
import { 
  HiOutlineSparkles
} from 'react-icons/hi';
import { 
  MdRestaurant
} from 'react-icons/md';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-lg p-4 rounded-2xl">
              <MdRestaurant className="text-6xl md:text-7xl" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            {t('home.title')}
            <br />
            <span className="bg-gradient-to-r from-yellow-200 to-yellow-100 bg-clip-text text-transparent">
              {t('home.subtitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('home.description')}
          </p>
          {isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/dashboard"
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2"
              >
                <FiBarChart2 />
                Go to Dashboard
                <FiArrowRight />
              </Link>
              <Link
                to="/daily-tracker"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-2"
              >
                <FiActivity />
                Track Meals
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2"
              >
                <HiOutlineSparkles />
                {t('home.getStarted')}
                <FiArrowRight />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center gap-2"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800 dark:text-gray-100">
              {t('home.features')}
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              {t('home.featuresDesc')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to={isAuthenticated ? "/foods" : "/register"}
              className="bg-white dark:bg-gray-800 text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <MdRestaurant className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.foodDatabase')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('home.foodDatabaseDesc')}
              </p>
              <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all">
                Explore <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link
              to={isAuthenticated ? "/meal-planner" : "/register"}
              className="bg-white dark:bg-gray-800 text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FiCalendar className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.mealPlans')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('home.mealPlansDesc')}
              </p>
              <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all">
                Plan Meals <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
            <Link
              to={isAuthenticated ? "/daily-tracker" : "/register"}
              className="bg-white dark:bg-gray-800 text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FiBarChart2 className="text-white text-4xl" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.foodTracking')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                {t('home.foodTrackingDesc')}
              </p>
              <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold group-hover:gap-2 transition-all">
                Start Tracking <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                Ready to Start Your Health Journey?
              </h2>
              <p className="text-xl mb-8 opacity-95">
                Join thousands of users managing their health with traditional Sri Lankan nutrition
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  to="/register"
                  className="bg-white text-primary-600 hover:bg-gray-50 px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 flex items-center gap-2"
                >
                  <HiOutlineSparkles />
                  Get Started Free
                  <FiArrowRight />
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 rounded-xl text-lg font-bold transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;

