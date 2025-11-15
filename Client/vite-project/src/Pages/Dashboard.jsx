import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import { fetchDailyIntake } from '../store/slices/mealSlice';
import { useTranslation } from '../Hooks/useTranslation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import axios from 'axios';
import { 
  FiActivity, 
  FiTrendingUp, 
  FiCoffee, 
  FiSun, 
  FiMoon, 
  FiApple,
  FiUser,
  FiBookOpen,
  FiCamera,
  FiCalendar,
  FiBarChart2
} from 'react-icons/fi';
import { 
  HiOutlineSparkles,
  HiOutlineUserGroup,
  HiOutlineBookOpen
} from 'react-icons/hi';
import { 
  MdRestaurant,
  MdLocalDining,
  MdChefHat,
  MdHealthAndSafety
} from 'react-icons/md';
import { 
  GiFruitBowl,
  GiBreadSlice,
  GiAvocado
} from 'react-icons/gi';
import { 
  FaFire,
  FaDumbbell
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { currentDailyIntake, loading: mealLoading, error } = useSelector((state) => state.meal);
  const { t } = useTranslation();
  const [nutritionGoals, setNutritionGoals] = useState({
    calories: 2000,
    protein: 125,
    carbs: 225,
    fat: 67,
    fiber: 25,
  });

  // Fetch nutrition goals from API
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token && user) {
          const response = await axios.get(`${API_URL}/tracking/goals`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.data) {
            setNutritionGoals(response.data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching nutrition goals:', error);
        // Use defaults if API fails
      }
    };

    if (user) {
      fetchGoals();
    }
  }, [user]);

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

  // Use nutrition goals from API (manual or profile-based)
  const dailyGoal = nutritionGoals.calories || 2000;
  const proteinGoal = nutritionGoals.protein || 125;
  const carbsGoal = nutritionGoals.carbs || 225;
  const fatGoal = nutritionGoals.fat || 67;

  const currentCalories = currentDailyIntake?.totalNutrition?.calories || 0;
  const calorieProgress = dailyGoal > 0 ? Math.min((currentCalories / dailyGoal) * 100, 100) : 0;

  // Calculate nutrition percentages
  const proteinProgress = proteinGoal > 0 ? Math.min(((currentDailyIntake?.totalNutrition?.protein || 0) / proteinGoal) * 100, 100) : 0;
  const carbsProgress = carbsGoal > 0 ? Math.min(((currentDailyIntake?.totalNutrition?.carbs || 0) / carbsGoal) * 100, 100) : 0;
  const fatProgress = fatGoal > 0 ? Math.min(((currentDailyIntake?.totalNutrition?.fat || 0) / fatGoal) * 100, 100) : 0;

  // Get today's meals summary
  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: FiCoffee, color: 'orange' },
    { id: 'lunch', label: 'Lunch', icon: MdLocalDining, color: 'yellow' },
    { id: 'dinner', label: 'Dinner', icon: FiMoon, color: 'purple' },
    { id: 'snack', label: 'Snack', icon: FiApple, color: 'green' },
  ];

  const foodsByMeal = mealTypes.reduce((acc, meal) => {
    acc[meal.id] = currentDailyIntake?.foods?.filter((f) => f.mealType === meal.id) || [];
    return acc;
  }, {});

  // Quick action cards
  const quickActions = [
    {
      title: 'Daily Tracker',
      description: 'Track your daily nutrition intake and meals',
      icon: FiBarChart2,
      link: '/daily-tracker',
      gradient: 'from-blue-500 to-cyan-500',
      color: 'blue',
    },
    {
      title: 'Food Database',
      description: 'Browse healthy Sri Lankan recipes',
      icon: MdRestaurant,
      link: '/foods',
      gradient: 'from-green-500 to-emerald-500',
      color: 'green',
    },
    {
      title: 'Meal Planner',
      description: 'Generate personalized meal plans',
      icon: FiCalendar,
      link: '/meal-planner',
      gradient: 'from-purple-500 to-pink-500',
      color: 'purple',
    },
    {
      title: 'Recipes',
      description: 'Explore traditional recipes',
      icon: MdChefHat,
      link: '/recipes',
      gradient: 'from-orange-500 to-red-500',
      color: 'orange',
    },
    {
      title: 'Scan Food',
      description: 'Scan and identify food items',
      icon: FiCamera,
      link: '/scan',
      gradient: 'from-indigo-500 to-blue-500',
      color: 'indigo',
    },
    {
      title: 'Meet Expert',
      description: 'Connect with nutrition experts',
      icon: HiOutlineUserGroup,
      link: '/meet-expert',
      gradient: 'from-teal-500 to-cyan-500',
      color: 'teal',
    },
    {
      title: 'Awareness',
      description: 'Learn about nutrition and health',
      icon: HiOutlineBookOpen,
      link: '/awareness',
      gradient: 'from-pink-500 to-rose-500',
      color: 'pink',
    },
    {
      title: 'Profile',
      description: 'Manage your health profile',
      icon: FiUser,
      link: '/profile',
      gradient: 'from-gray-600 to-gray-800',
      color: 'gray',
    },
  ];

  // Show loading state
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 rounded-2xl shadow-xl p-6 md:p-8 text-white mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl md:text-5xl font-bold mb-2">
                  Welcome back, {user?.name || 'User'}!
                </h1>
                <p className="text-primary-100 text-lg">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
              <MdRestaurant className="text-6xl md:text-7xl opacity-20" />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded mb-6">
              <p className="font-semibold">{error}</p>
              <p className="text-sm mt-1">Showing dashboard with empty data. Start tracking your meals!</p>
            </div>
          )}
        </div>

        {/* Today's Nutrition Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Daily Calories</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {currentCalories.toFixed(0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">of {dailyGoal} kcal</p>
              </div>
              <FaFire className="text-4xl text-red-500" />
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  calorieProgress > 100 ? 'bg-red-500' : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${Math.min(calorieProgress, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {calorieProgress.toFixed(1)}% Complete
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Protein</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {(currentDailyIntake?.totalNutrition?.protein || 0).toFixed(0)}g
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">of {proteinGoal}g goal</p>
              </div>
              <FaDumbbell className="text-4xl text-blue-500" />
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all"
                style={{ width: `${proteinProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {proteinProgress.toFixed(1)}% Complete
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Carbs</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {(currentDailyIntake?.totalNutrition?.carbs || 0).toFixed(0)}g
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">of {carbsGoal}g goal</p>
              </div>
              <GiBreadSlice className="text-4xl text-orange-500" />
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all"
                style={{ width: `${carbsProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {carbsProgress.toFixed(1)}% Complete
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Fat</p>
                <p className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
                  {(currentDailyIntake?.totalNutrition?.fat || 0).toFixed(0)}g
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">of {fatGoal}g goal</p>
              </div>
              <GiAvocado className="text-4xl text-purple-500" />
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                style={{ width: `${fatProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {fatProgress.toFixed(1)}% Complete
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-8">
          {/* Today's Meals Summary */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Today's Meals
              </h2>
              <Link
                to="/daily-tracker"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold flex items-center gap-1"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {mealTypes.map((meal) => {
                const mealFoods = foodsByMeal[meal.id];
                const mealCalories = mealFoods.reduce(
                  (sum, food) => sum + (food.nutrition?.calories || 0),
                  0
                );
                return (
                  <div
                    key={meal.id}
                    className={`bg-gradient-to-br ${
                      meal.color === 'orange' ? 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20' :
                      meal.color === 'yellow' ? 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20' :
                      meal.color === 'purple' ? 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20' :
                      'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20'
                    } rounded-lg p-4 border border-gray-200 dark:border-gray-700`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {meal.icon && <meal.icon className="text-2xl text-gray-700 dark:text-gray-300" />}
                        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{meal.label}</h3>
                      </div>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                        {mealCalories.toFixed(0)} kcal
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {mealFoods.length} {mealFoods.length === 1 ? 'item' : 'items'}
                    </p>
                    {mealFoods.length === 0 && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 italic mt-1">
                        No items yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health Profile Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Health Profile
              </h2>
              <Link
                to="/profile"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-semibold"
              >
                Edit →
              </Link>
            </div>
            {user?.healthProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">BMI</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {user.healthProfile.bmi ? user.healthProfile.bmi.toFixed(1) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Weight</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-gray-100">
                      {user.healthProfile.weight || 'N/A'} kg
                    </p>
                  </div>
                </div>
                {user.healthProfile.goals?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Goals</p>
                    <div className="flex flex-wrap gap-2">
                      {user.healthProfile.goals.slice(0, 3).map((goal, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded-full text-xs"
                        >
                          {goal.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <Link
                  to="/profile"
                  className="block w-full text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-semibold"
                >
                  Update Profile
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <FiUser className="text-4xl mb-3 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  Complete your profile to get personalized recommendations
                </p>
                <Link
                  to="/profile"
                  className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all text-sm font-semibold"
                >
                  Setup Profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Nutrition Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Daily Nutrition Overview
          </h2>
          {nutritionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nutritionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#38966e" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <FiBarChart2 className="text-6xl mb-4 text-gray-400" />
              <p>No nutrition data available</p>
              <p className="text-sm mt-2">Start tracking your meals to see your nutrition overview</p>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${action.gradient} flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon && <action.icon />}
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.description}
                </p>
                <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Go to {action.title} →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

