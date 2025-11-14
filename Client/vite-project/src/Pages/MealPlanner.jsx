import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { generateMealPlan, fetchMealPlans, createMealPlan } from '../store/slices/mealSlice';
import { format, addDays, startOfWeek } from 'date-fns';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MealPlanner = () => {
  const dispatch = useDispatch();
  const { currentMealPlan, loading, error } = useSelector((state) => state.meal);
  const { user } = useSelector((state) => state.auth);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedWeek, setSelectedWeek] = useState(new Date());

  useEffect(() => {
    loadMealPlan(selectedDate);
  }, [selectedDate]);

  const loadMealPlan = async (date) => {
    try {
      const response = await axios.get(`${API_URL}/mealplans`, {
        params: { startDate: date, endDate: date },
      });
      if (response.data.data && response.data.data.length > 0) {
        // Meal plan exists for this date
        dispatch({ type: 'meal/setCurrentMealPlan', payload: response.data.data[0] });
      } else {
        dispatch({ type: 'meal/clearCurrentMealPlan' });
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
    }
  };

  const handleGenerateMealPlan = () => {
    if (!user?.healthProfile?.dailyCalorieGoal) {
      alert('Please update your health profile with weight, height, and activity level first.');
      return;
    }
    dispatch(generateMealPlan(selectedDate));
  };

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealIcons = { breakfast: '🌅', lunch: '🍛', dinner: '🌙', snack: '🍎' };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Meal Planner</h1>
        <p className="text-gray-600">
          Generate personalized meal plans based on your health profile and goals
        </p>
      </div>

      {/* Date Selection */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={handleGenerateMealPlan}
            disabled={loading}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Meal Plan'}
          </button>
        </div>

        {/* Week View */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              ← Previous Week
            </button>
            <h3 className="font-semibold text-gray-800">
              Week of {format(weekStart, 'MMM d')}
            </h3>
            <button
              onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Next Week →
            </button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const isSelected = dayStr === selectedDate;
              return (
                <button
                  key={dayStr}
                  onClick={() => setSelectedDate(dayStr)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-xs text-gray-600">{format(day, 'EEE')}</div>
                  <div className="text-lg font-bold">{format(day, 'd')}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Meal Plan Display */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : currentMealPlan ? (
        <div className="space-y-6">
          {/* Total Nutrition Summary */}
          <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Daily Nutrition Summary - {format(new Date(selectedDate), 'MMMM d, yyyy')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Calories</p>
                <p className="text-2xl font-bold text-primary-600">
                  {currentMealPlan.totalNutrition?.calories?.toFixed(0) || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Protein</p>
                <p className="text-2xl font-bold text-blue-600">
                  {currentMealPlan.totalNutrition?.protein?.toFixed(0) || 0}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Carbs</p>
                <p className="text-2xl font-bold text-orange-600">
                  {currentMealPlan.totalNutrition?.carbs?.toFixed(0) || 0}g
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fat</p>
                <p className="text-2xl font-bold text-purple-600">
                  {currentMealPlan.totalNutrition?.fat?.toFixed(0) || 0}g
                </p>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mealTypes.map((mealType) => {
              const meal = currentMealPlan.meals?.find((m) => m.mealType === mealType);
              return (
                <div key={mealType} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{mealIcons[mealType]}</span>
                    <h3 className="text-xl font-bold text-gray-800 capitalize">
                      {mealType}
                    </h3>
                  </div>

                  {meal && meal.items && meal.items.length > 0 ? (
                    <>
                      <div className="space-y-3 mb-4">
                        {meal.items.map((item, index) => (
                          <div key={index} className="border-b pb-3 last:border-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">
                                  {item.foodName || item.foodId?.name?.en || 'Food Item'}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity}x
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-primary-600">
                                  {item.nutrition?.calories?.toFixed(0) || 0} kcal
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-600">
                          Total: {meal.totalNutrition?.calories?.toFixed(0) || 0} kcal |{' '}
                          P: {meal.totalNutrition?.protein?.toFixed(0) || 0}g |{' '}
                          C: {meal.totalNutrition?.carbs?.toFixed(0) || 0}g |{' '}
                          F: {meal.totalNutrition?.fat?.toFixed(0) || 0}g
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 italic">No items planned</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No meal plan generated</h3>
          <p className="text-gray-600 mb-6">
            Click "Generate Meal Plan" to create a personalized meal plan for this date
          </p>
          {!user?.healthProfile?.dailyCalorieGoal && (
            <p className="text-sm text-orange-600">
              Please update your health profile first to generate meal plans
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanner;

