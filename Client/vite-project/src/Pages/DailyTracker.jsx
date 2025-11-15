import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchDailyIntake,
  removeFoodFromIntake,
} from '../store/slices/mealSlice';
import { fetchRecipes } from '../store/slices/recipeSlice';
import { useTranslation } from '../Hooks/useTranslation';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const DailyTracker = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { currentDailyIntake, loading } = useSelector((state) => state.meal);
  const { recipes, loading: recipesLoading } = useSelector((state) => state.recipe);
  const { user } = useSelector((state) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [nutritionGoals, setNutritionGoals] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null); // 'breakfast', 'lunch', 'dinner', 'snack'
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [finalizeData, setFinalizeData] = useState(null);
  const [warningExceeded, setWarningExceeded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [useManualGoals, setUseManualGoals] = useState(false);
  const [manualGoals, setManualGoals] = useState(null);
  
  const { register: registerManual, handleSubmit: handleManualSubmit, reset: resetManual } = useForm();
  const { register: registerGoals, handleSubmit: handleGoalsSubmit, reset: resetGoals, setValue: setGoalsValue } = useForm();

  const mealTypes = [
    { id: 'breakfast', label: 'Breakfast', icon: '🌅', color: 'orange' },
    { id: 'lunch', label: 'Lunch', icon: '🍛', color: 'yellow' },
    { id: 'dinner', label: 'Dinner', icon: '🌙', color: 'purple' },
    { id: 'snack', label: 'Snack', icon: '🍎', color: 'green' },
  ];

  // Load manual goals from backend on mount
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/tracking/goals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.source === 'manual') {
          setManualGoals(response.data.data);
          setUseManualGoals(true);
          setNutritionGoals(response.data.data);
          // Also save to localStorage for backward compatibility
          localStorage.setItem('dailyTrackerManualGoals', JSON.stringify(response.data.data));
          localStorage.setItem('dailyTrackerUseManual', 'true');
        } else {
          setNutritionGoals(response.data.data);
          setUseManualGoals(false);
          setManualGoals(null);
        }
      } catch (error) {
        console.error('Error fetching goals:', error);
        // Fallback to localStorage if API fails
        const savedManualGoals = localStorage.getItem('dailyTrackerManualGoals');
        const savedUseManual = localStorage.getItem('dailyTrackerUseManual') === 'true';
        
        if (savedManualGoals && savedUseManual) {
          try {
            const goals = JSON.parse(savedManualGoals);
            setManualGoals(goals);
            setUseManualGoals(true);
            setNutritionGoals(goals);
          } catch (parseError) {
            console.error('Error parsing saved manual goals:', parseError);
          }
        }
      }
    };
    
    if (user) {
      fetchGoals();
    }
  }, [user]);

  // Fetch daily intake
  useEffect(() => {
    dispatch(fetchDailyIntake(selectedDate));
  }, [dispatch, selectedDate]);

  // Fetch recipes when modal opens
  useEffect(() => {
    if (showRecipeModal) {
      dispatch(fetchRecipes({ search: '', limit: 100 }));
    }
  }, [dispatch, showRecipeModal]);

  // Check for exceeded limits
  useEffect(() => {
    if (currentDailyIntake && nutritionGoals) {
      const consumed = currentDailyIntake.totalNutrition?.calories || 0;
      const goal = nutritionGoals.calories || 2000;
      if (consumed > goal) {
        setWarningExceeded(true);
      } else {
        setWarningExceeded(false);
      }
    }
  }, [currentDailyIntake, nutritionGoals]);

  const consumed = currentDailyIntake?.totalNutrition || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  // Determine which goals to use (manual or from profile)
  const goals = (useManualGoals && manualGoals) ? manualGoals : (nutritionGoals || {
    calories: 2000,
    protein: 125,
    carbs: 225,
    fat: 67,
    fiber: 25,
  });

  const remaining = {
    calories: Math.max(0, goals.calories - consumed.calories),
    protein: Math.max(0, goals.protein - consumed.protein),
    carbs: Math.max(0, goals.carbs - consumed.carbs),
    fat: Math.max(0, goals.fat - consumed.fat),
    fiber: Math.max(0, goals.fiber - consumed.fiber),
  };

  const exceeded = {
    calories: Math.max(0, consumed.calories - goals.calories),
    protein: Math.max(0, consumed.protein - goals.protein),
    carbs: Math.max(0, consumed.carbs - goals.carbs),
    fat: Math.max(0, consumed.fat - goals.fat),
    fiber: Math.max(0, consumed.fiber - goals.fiber),
  };

  const calculatePercentage = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const nutritionItems = [
    {
      key: 'calories',
      label: 'Calories',
      unit: 'kcal',
      icon: '🔥',
      color: 'red',
      gradient: 'from-red-500 to-pink-500',
    },
    {
      key: 'protein',
      label: 'Protein',
      unit: 'g',
      icon: '💪',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'carbs',
      label: 'Carbs',
      unit: 'g',
      icon: '🍞',
      color: 'orange',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      key: 'fat',
      label: 'Fat',
      unit: 'g',
      icon: '🥑',
      color: 'yellow',
      gradient: 'from-yellow-500 to-orange-500',
    },
    {
      key: 'fiber',
      label: 'Fiber',
      unit: 'g',
      icon: '🌾',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const handleAddRecipe = async (recipeId, servings = 1) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/tracking/recipe`,
        {
          recipeId,
          mealType: selectedMeal,
          date: selectedDate,
          servings,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(fetchDailyIntake(selectedDate));
      setShowRecipeModal(false);
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error adding recipe:', error);
      alert('Failed to add recipe');
    }
  };

  const handleAddManual = async (data) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/tracking/manual`,
        {
          foodName: data.foodName,
          nutrition: {
            calories: parseFloat(data.calories) || 0,
            protein: parseFloat(data.protein) || 0,
            carbs: parseFloat(data.carbs) || 0,
            fat: parseFloat(data.fat) || 0,
            fiber: parseFloat(data.fiber) || 0,
          },
          mealType: selectedMeal,
          date: selectedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      dispatch(fetchDailyIntake(selectedDate));
      setShowManualModal(false);
      resetManual();
      setSelectedMeal(null);
    } catch (error) {
      console.error('Error adding manual entry:', error);
      alert('Failed to add manual entry');
    }
  };

  const handleFinalizeMeal = async () => {
    if (!selectedMeal) {
      alert('Please select a meal first');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to finalize meals');
        return;
      }
      const response = await axios.post(
        `${API_URL}/tracking/finalize-meal`,
        {
          mealType: selectedMeal,
          date: selectedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFinalizeData(response.data.data);
      setShowFinalizeModal(true);
      dispatch(fetchDailyIntake(selectedDate));
    } catch (error) {
      console.error('Error finalizing meal:', error);
      const errorMsg = error.response?.data?.message || 'Failed to finalize meal';
      alert(errorMsg);
    }
  };

  const handleRemoveFood = async (intakeId, foodItemId) => {
    if (!intakeId || !foodItemId) {
      console.error('Missing intakeId or foodItemId');
      return;
    }
    if (window.confirm('Are you sure you want to remove this item?')) {
      try {
        await dispatch(removeFoodFromIntake({ intakeId: String(intakeId), foodItemId: String(foodItemId) })).unwrap();
        dispatch(fetchDailyIntake(selectedDate));
      } catch (error) {
        console.error('Error removing food:', error);
        alert('Failed to remove item. Please try again.');
      }
    }
  };

  // Handle manual goals submission
  const handleSaveGoals = async (data) => {
    const goalsData = {
      calories: parseFloat(data.calories) || 2000,
      protein: parseFloat(data.protein) || 125,
      carbs: parseFloat(data.carbs) || 225,
      fat: parseFloat(data.fat) || 67,
      fiber: parseFloat(data.fiber) || 25,
    };

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/tracking/goals`,
        goalsData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setManualGoals(goalsData);
        setUseManualGoals(true);
        setNutritionGoals(goalsData);
        
        // Also save to localStorage for backward compatibility
        localStorage.setItem('dailyTrackerManualGoals', JSON.stringify(goalsData));
        localStorage.setItem('dailyTrackerUseManual', 'true');
        
        setShowGoalsModal(false);
        alert('Daily limits updated successfully!');
      }
    } catch (error) {
      console.error('Error saving goals:', error);
      alert(error.response?.data?.message || 'Failed to save daily limits. Please try again.');
    }
  };

  // Handle switching back to profile goals
  const handleUseProfileGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tracking/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUseManualGoals(false);
      setManualGoals(null);
      localStorage.removeItem('dailyTrackerManualGoals');
      localStorage.removeItem('dailyTrackerUseManual');
      
      // Refetch profile goals
      const response = await axios.get(`${API_URL}/tracking/goals`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNutritionGoals(response.data.data);
    } catch (error) {
      console.error('Error clearing manual goals:', error);
      alert(error.response?.data?.message || 'Failed to switch to profile goals. Please try again.');
    }
  };

  // Initialize goals form with current values
  useEffect(() => {
    if (showGoalsModal && goals) {
      setGoalsValue('calories', goals.calories || 2000);
      setGoalsValue('protein', goals.protein || 125);
      setGoalsValue('carbs', goals.carbs || 225);
      setGoalsValue('fat', goals.fat || 67);
      setGoalsValue('fiber', goals.fiber || 25);
    }
  }, [showGoalsModal, goals, setGoalsValue]);

  // Group foods by meal type
  const foodsByMeal = mealTypes.reduce((acc, meal) => {
    acc[meal.id] =
      currentDailyIntake?.foods?.filter((f) => f.mealType === meal.id) || [];
    return acc;
  }, {});

  // Calculate meal totals
  const calculateMealTotal = (mealFoods) => {
    return mealFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.nutrition?.calories || 0),
        protein: acc.protein + (food.nutrition?.protein || 0),
        carbs: acc.carbs + (food.nutrition?.carbs || 0),
        fat: acc.fat + (food.nutrition?.fat || 0),
        fiber: acc.fiber + (food.nutrition?.fiber || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  const filteredRecipes = recipes ? recipes.filter((recipe) =>
    recipe.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📊 Daily Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your nutrition goals and manage your meals
            </p>
          </div>
          <div className="flex justify-center gap-4 items-center">
            <button
              onClick={() => setShowGoalsModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition shadow-md hover:shadow-lg flex items-center gap-2"
            >
              ⚙️ {useManualGoals ? 'Edit' : 'Set'} Daily Limits
            </button>
            {useManualGoals && (
              <button
                onClick={handleUseProfileGoals}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
              >
                Use Profile Limits
              </button>
            )}
            {useManualGoals && (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                ✓ Using Custom Limits
              </span>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        {warningExceeded && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl shadow-lg animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h3 className="font-bold text-lg">Daily Limit Exceeded!</h3>
                  <p>You've consumed {exceeded.calories.toFixed(0)} calories over your daily goal.</p>
                </div>
              </div>
              <button
                onClick={() => setWarningExceeded(false)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Nutrition Progress Tiles - Parallel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {nutritionItems.map((item) => {
            const current = consumed[item.key] || 0;
            const goal = goals[item.key] || 1;
            const remain = remaining[item.key] || 0;
            const exceed = exceeded[item.key] || 0;
            const percentage = calculatePercentage(current, goal);
            const isExceeded = current > goal;

            return (
              <div
                key={item.key}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 ${
                  isExceeded ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">{item.label}</h3>
                  </div>
                  {isExceeded && <span className="text-red-500 text-xs">⚠️</span>}
                </div>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.gradient} transition-all duration-500`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Values */}
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Goal:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {goal.toFixed(item.key === 'calories' ? 0 : 1)} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Consumed:</span>
                    <span className={`font-semibold ${isExceeded ? 'text-red-500' : 'text-green-600'}`}>
                      {current.toFixed(item.key === 'calories' ? 0 : 1)} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      {isExceeded ? 'Exceeded:' : 'Remaining:'}
                    </span>
                    <span className={`font-semibold ${isExceeded ? 'text-red-500' : 'text-blue-600'}`}>
                      {isExceeded ? '+' : ''}
                      {(isExceeded ? exceed : remain).toFixed(item.key === 'calories' ? 0 : 1)} {item.unit}
                    </span>
                  </div>
                  <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {percentage.toFixed(1)}% Complete
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Meals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mealTypes.map((meal) => {
            const mealFoods = foodsByMeal[meal.id];
            const mealTotal = calculateMealTotal(mealFoods);
            const hasFoods = mealFoods.length > 0;

            return (
              <div
                key={meal.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                {/* Meal Header */}
                <div className={`bg-gradient-to-r ${
                  meal.color === 'orange' ? 'from-orange-400 to-orange-600' :
                  meal.color === 'yellow' ? 'from-yellow-400 to-yellow-600' :
                  meal.color === 'purple' ? 'from-purple-400 to-purple-600' :
                  'from-green-400 to-green-600'
                } p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{meal.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{meal.label}</h3>
                        <p className="text-sm opacity-90">{mealTotal.calories.toFixed(0)} kcal</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedMeal(meal.id);
                          setShowRecipeModal(true);
                        }}
                        className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                      >
                        + Recipe
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMeal(meal.id);
                          setShowManualModal(true);
                        }}
                        className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
                      >
                        + Manual
                      </button>
                      {hasFoods && (
                        <button
                          onClick={() => {
                            setSelectedMeal(meal.id);
                            handleFinalizeMeal();
                          }}
                          className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                          title="Finalize meal and send email notification"
                        >
                          ✓ Finalize
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meal Items */}
                <div className="p-4">
                  {hasFoods ? (
                    <div className="space-y-3">
                      {mealFoods.map((food, index) => {
                        const foodItemId = food._id ? String(food._id) : index;
                        return (
                          <div
                            key={foodItemId}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800 dark:text-gray-200">
                                {food.foodName}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {food.nutrition?.calories?.toFixed(0) || 0} kcal | 
                                P: {food.nutrition?.protein?.toFixed(1) || 0}g | 
                                C: {food.nutrition?.carbs?.toFixed(1) || 0}g | 
                                F: {food.nutrition?.fat?.toFixed(1) || 0}g
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                if (currentDailyIntake?._id) {
                                  handleRemoveFood(currentDailyIntake._id, foodItemId);
                                }
                              }}
                              className="text-red-500 hover:text-red-700 text-xl ml-2 font-bold"
                              title="Remove item"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                        <strong>Total:</strong> {mealTotal.calories.toFixed(0)} kcal | 
                        P: {mealTotal.protein.toFixed(1)}g | 
                        C: {mealTotal.carbs.toFixed(1)}g | 
                        F: {mealTotal.fat.toFixed(1)}g | 
                        Fiber: {mealTotal.fiber.toFixed(1)}g
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                      No items added yet. Add a recipe or manual entry!
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Recipe Selection Modal */}
        {showRecipeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Select Recipe for {mealTypes.find(m => m.id === selectedMeal)?.label}
                  </h2>
                  <button
                    onClick={() => {
                      setShowRecipeModal(false);
                      setSelectedMeal(null);
                      setSearchTerm('');
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    dispatch(fetchRecipes({ search: e.target.value, limit: 100 }));
                  }}
                  className="mt-4 w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="flex-1 overflow-y-auto p-6">
                {recipesLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredRecipes.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No recipes found. Try a different search term.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredRecipes.slice(0, 20).map((recipe) => (
                      <div
                        key={recipe._id}
                        className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 transition cursor-pointer"
                        onClick={() => handleAddRecipe(recipe._id, 1)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{recipe.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {recipe.nutrition?.calories || 0} kcal | 
                              P: {recipe.nutrition?.proteins || 0}g | 
                              C: {recipe.nutrition?.carbohydrates || 0}g
                            </p>
                            {recipe.dietaryType && (
                              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
                                {recipe.dietaryType}
                              </span>
                            )}
                          </div>
                          <button 
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition ml-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddRecipe(recipe._id, 1);
                            }}
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Manual Entry Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Manual Entry for {mealTypes.find(m => m.id === selectedMeal)?.label}
                  </h2>
                  <button
                    onClick={() => {
                      setShowManualModal(false);
                      setSelectedMeal(null);
                      resetManual();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleManualSubmit(handleAddManual)} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Food Name *
                  </label>
                  <input
                    {...registerManual('foodName', { required: true })}
                    type="text"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Grilled Chicken Breast"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Calories *
                  </label>
                  <input
                    {...registerManual('calories', { required: true, min: 0 })}
                    type="number"
                    step="0.1"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Protein (g)
                    </label>
                    <input
                      {...registerManual('protein', { min: 0 })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Carbs (g)
                    </label>
                    <input
                      {...registerManual('carbs', { min: 0 })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fat (g)
                    </label>
                    <input
                      {...registerManual('fat', { min: 0 })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fiber (g)
                    </label>
                    <input
                      {...registerManual('fiber', { min: 0 })}
                      type="number"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Add to {mealTypes.find(m => m.id === selectedMeal)?.label}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Finalize Meal Modal */}
        {showFinalizeModal && finalizeData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full">
              <div className={`p-6 border-b-4 ${
                finalizeData.hasExceeded 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500' 
                  : 'bg-green-50 dark:bg-green-900/20 border-green-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                      {finalizeData.hasExceeded ? '⚠️ Limit Exceeded!' : '✅ Meal Finalized!'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {mealTypes.find(m => m.id === selectedMeal)?.label} finalized successfully
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowFinalizeModal(false);
                      setFinalizeData(null);
                      setSelectedMeal(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6">
                <p className="mb-4 text-gray-700 dark:text-gray-300">
                  {finalizeData.hasExceeded 
                    ? `You've exceeded your daily limit by ${finalizeData.exceeded.calories.toFixed(0)} calories.`
                    : `You have ${finalizeData.remaining.calories.toFixed(0)} calories remaining for today.`
                  }
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Consumed:</span>
                    <span className="font-semibold">{finalizeData.consumed.calories.toFixed(0)} kcal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remaining:</span>
                    <span className={`font-semibold ${finalizeData.hasExceeded ? 'text-red-500' : 'text-green-500'}`}>
                      {finalizeData.hasExceeded 
                        ? `+${finalizeData.exceeded.calories.toFixed(0)} kcal`
                        : `${finalizeData.remaining.calories.toFixed(0)} kcal`
                      }
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  📧 An email notification has been sent to your registered email with detailed nutrition information.
                </p>
                <button
                  onClick={() => {
                    setShowFinalizeModal(false);
                    setFinalizeData(null);
                    setSelectedMeal(null);
                  }}
                  className="w-full mt-4 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Set Daily Limits Modal */}
        {showGoalsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    Set Daily Nutrition Limits
                  </h2>
                  <button
                    onClick={() => {
                      setShowGoalsModal(false);
                      resetGoals();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>
              <form onSubmit={handleGoalsSubmit(handleSaveGoals)} className="p-6 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Set your daily calorie and nutrition limits. These will override your profile settings for the Daily Tracker.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Calories (kcal) *
                  </label>
                  <input
                    {...registerGoals('calories', { 
                      required: 'Calories are required',
                      min: { value: 1000, message: 'Minimum 1000 kcal' },
                      max: { value: 5000, message: 'Maximum 5000 kcal' }
                    })}
                    type="number"
                    step="1"
                    min="1000"
                    max="5000"
                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="2000"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Protein (g) *
                    </label>
                    <input
                      {...registerGoals('protein', { 
                        required: 'Protein is required',
                        min: { value: 0, message: 'Minimum 0g' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="125"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Carbs (g) *
                    </label>
                    <input
                      {...registerGoals('carbs', { 
                        required: 'Carbs are required',
                        min: { value: 0, message: 'Minimum 0g' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="225"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fat (g) *
                    </label>
                    <input
                      {...registerGoals('fat', { 
                        required: 'Fat is required',
                        min: { value: 0, message: 'Minimum 0g' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="67"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fiber (g) *
                    </label>
                    <input
                      {...registerGoals('fiber', { 
                        required: 'Fiber is required',
                        min: { value: 0, message: 'Minimum 0g' }
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="25"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition"
                  >
                    Save Limits
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoalsModal(false);
                      resetGoals();
                    }}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTracker;

