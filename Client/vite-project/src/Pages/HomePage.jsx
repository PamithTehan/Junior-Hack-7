import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useTranslation } from '../Hooks/useTranslation';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-primary-400 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            {t('home.title')}
            <br />
            <span className="bg-gradient-to-r from-secondary-300 to-secondary-100 bg-clip-text text-transparent">
              {t('home.subtitle')}
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95 leading-relaxed">
            {t('home.description')}
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 hover:bg-gray-50 px-10 py-4 rounded-full text-lg font-bold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105"
              >
                {t('home.getStarted')}
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-10 py-4 rounded-full text-lg font-bold transition-all"
              >
                {t('nav.login')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800 dark:text-gray-100">
            {t('home.features')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
            {t('home.featuresDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 text-center p-8 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900 dark:to-primary-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🍚</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.foodDatabase')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.foodDatabaseDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 text-center p-8 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-50 dark:from-secondary-900 dark:to-secondary-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.mealPlans')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.mealPlansDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-700 text-center p-8 rounded-2xl border border-gray-100 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="bg-gradient-to-br from-accent-100 to-accent-50 dark:from-accent-900 dark:to-accent-800 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">{t('home.foodTracking')}</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('home.foodTrackingDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Traditional Foods Gallery */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800 dark:text-gray-100">
            {t('home.traditionalFoods')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 text-lg">
            {t('home.traditionalFoodsDesc')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { name: 'Rice & Curry', emoji: '🍛' },
              { name: 'Hopper (Appa)', emoji: '🥞' },
              { name: 'String Hoppers', emoji: '🍜' },
              { name: 'Dhal Curry', emoji: '🍲' },
              { name: 'Pol Sambol', emoji: '🌶️' },
              { name: 'Jackfruit', emoji: '🌳' },
              { name: 'Kottu Roti', emoji: '🥘' },
              { name: 'Kiribath', emoji: '🍚' },
            ].map((food, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 md:p-6 rounded-xl text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600"
              >
                <div className="text-4xl md:text-5xl mb-3 transform hover:scale-125 transition-transform">{food.emoji}</div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm md:text-base">{food.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Goals Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center mb-4 text-gray-800 dark:text-gray-100">
            {t('home.manageHealth')}
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-16 text-lg">
            {t('home.manageHealthDesc')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl border-2 border-red-200 hover:border-red-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">💉</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-red-800">{t('home.diabetes')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {t('home.diabetesDesc')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">⚖️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-orange-800">{t('home.weight')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {t('home.weightDesc')}
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl border-2 border-blue-200 hover:border-blue-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
                <span className="text-3xl">❤️</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-blue-800">{t('home.heart')}</h3>
              <p className="text-gray-700 leading-relaxed">
                {t('home.heartDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

