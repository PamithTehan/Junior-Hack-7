import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import { fetchDailyIntake } from '../store/slices/mealSlice';
import { useTranslation } from '../hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { currentDailyIntake, loading: mealLoading, error } = useSelector((state) => state.meal);
  const { t } = useTranslation();

  useEffect(() => {
    if (user || !authLoading) {
      const today = format(new Date(), 'yyyy-MM-dd');
      dispatch(fetchDailyIntake(today));
    }
  }, [dispatch, user, authLoading]);

  // Show loading only if auth or meal data is loading
  const isLoading = authLoading || mealLoading;

  const nutritionData = currentDailyIntake
    ? [
        { name: 'Calories', value: currentDailyIntake.totalNutrition?.calories || 0 },
        { name: 'Protein', value: currentDailyIntake.totalNutrition?.protein || 0 },
        { name: 'Carbs', value: currentDailyIntake.totalNutrition?.carbs || 0 },
        { name: 'Fat', value: currentDailyIntake.totalNutrition?.fat || 0 },
      ]
    : [];

  const pieColors = ['#38966e', '#f97316', '#cc8747', '#8b5cf6'];

  const dailyGoal = user?.healthProfile?.dailyCalorieGoal || 2000;
  const currentCalories = currentDailyIntake?.totalNutrition?.calories || 0;
  const calorieProgress = Math.min((currentCalories / dailyGoal) * 100, 100);

  // Show loading state
  if (isLoading && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      {/* Error Message */}
      {error && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <p className="text-sm mt-1">Showing dashboard with empty data. Start tracking your meals!</p>
        </div>
      )}

      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('dashboard.welcome')}, {user?.name || 'User'}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('dashboard.overview')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('dashboard.dailyCalories')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentCalories.toFixed(0)} / {dailyGoal}
              </p>
            </div>
            <div className="text-2xl md:text-3xl">🔥</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all"
                style={{ width: `${calorieProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('dashboard.protein')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentDailyIntake?.totalNutrition?.protein?.toFixed(0) || 0}g
              </p>
            </div>
            <div className="text-2xl md:text-3xl">🍗</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('dashboard.carbs')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentDailyIntake?.totalNutrition?.carbs?.toFixed(0) || 0}g
              </p>
            </div>
            <div className="text-2xl md:text-3xl">🍚</div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('dashboard.fat')}</p>
              <p className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
                {currentDailyIntake?.totalNutrition?.fat?.toFixed(0) || 0}g
              </p>
            </div>
            <div className="text-2xl md:text-3xl">🥑</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8">
        {/* Nutrition Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.dailyNutrition')}</h2>
          {nutritionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#38966e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                {t('dashboard.noData')}
              </div>
          )}
        </div>

        {/* Health Profile */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">{t('dashboard.healthProfile')}</h2>
          {user?.healthProfile ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.bmi')}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{user.healthProfile.bmi || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.weight')}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{user.healthProfile.weight || 'N/A'} kg</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.height')}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{user.healthProfile.height || 'N/A'} cm</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">{t('dashboard.age')}:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">{user.healthProfile.age || 'N/A'} years</span>
              </div>
              {user.healthProfile.healthConditions?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{t('dashboard.healthConditions')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.healthProfile.healthConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm"
                      >
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.healthProfile.goals?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{t('dashboard.goals')}:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.healthProfile.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <Link
                to="/profile"
                className="block mt-6 text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                {t('dashboard.updateProfile')}
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('dashboard.setupProfile')}</p>
              <Link
                to="/profile"
                className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all"
              >
                {t('dashboard.setupProfileBtn')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <Link
          to="/foods"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="text-4xl mb-3">🍛</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('dashboard.foodDatabase')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.foodDatabaseDesc')}</p>
        </Link>

        <Link
          to="/meal-planner"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="text-4xl mb-3">📅</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('dashboard.mealPlanner')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.mealPlannerDesc')}</p>
        </Link>

        <Link
          to="/tracker"
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
        >
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('dashboard.foodTracker')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('dashboard.foodTrackerDesc')}</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;

