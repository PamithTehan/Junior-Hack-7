import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
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
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    if (user) {
      // Always try to load or generate meal plan when date or user changes
      loadMealPlan(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, user]);

  const getNutritionGoals = async () => {
    // Default goals to use if no goals are defined
    const defaultGoals = {
      calories: 2000,
      protein: 125,
      carbs: 225,
      fat: 67,
      fiber: 25,
    };

    // Fetch from API (which returns manual goals if set, otherwise profile goals)
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/tracking/goals`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.data && response.data.data.calories) {
        return response.data.data;
      }
      
      // If API returns invalid data, use defaults
      return defaultGoals;
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
      // Return default goals if API fails
      return defaultGoals;
    }
  };

  const loadMealPlan = async (date) => {
    try {
      const token = localStorage.getItem('token');
      
      // First, try to get existing meal plan
      const response = await axios.get(`${API_URL}/mealplans`, {
        params: { startDate: date, endDate: date },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.data && response.data.data.length > 0) {
        // Meal plan exists for this date
        dispatch({ type: 'meal/setCurrentMealPlan', payload: response.data.data[0] });
        return;
      }
      
      // No existing plan - auto-generate one using Daily Tracker limits or defaults
      // Get nutrition goals from daily tracker (or use defaults)
      const nutritionGoals = await getNutritionGoals();
      
      // Always use valid goals (defaults if needed)
      const goalsToUse = nutritionGoals && nutritionGoals.calories 
        ? nutritionGoals 
        : {
            calories: 2000,
            protein: 125,
            carbs: 225,
            fat: 67,
            fiber: 25,
          };
      
      // Always generate meal plan with goals (automatic, no user input needed)
      console.log('Auto-generating meal plan with goals:', goalsToUse, 'for date:', date);
      const result = await dispatch(generateMealPlan({ date, nutritionGoals: goalsToUse }));
      
      // If generation was successful, the meal plan should be in the state
      if (result.type === 'meal/generateMealPlan/fulfilled' && result.payload) {
        dispatch({ type: 'meal/setCurrentMealPlan', payload: result.payload });
      } else if (result.type === 'meal/generateMealPlan/rejected') {
        // If generation failed, try again with defaults
        console.log('Generation failed, retrying with defaults');
        const defaultGoals = {
          calories: 2000,
          protein: 125,
          carbs: 225,
          fat: 67,
          fiber: 25,
        };
        const retryResult = await dispatch(generateMealPlan({ date, nutritionGoals: defaultGoals }));
        if (retryResult.type === 'meal/generateMealPlan/fulfilled' && retryResult.payload) {
          dispatch({ type: 'meal/setCurrentMealPlan', payload: retryResult.payload });
        }
      }
    } catch (error) {
      console.error('Error loading meal plan:', error);
      console.error('Error details:', error.response?.data);
      
      // Even on error, try to generate with defaults
      try {
        const defaultGoals = {
          calories: 2000,
          protein: 125,
          carbs: 225,
          fat: 67,
          fiber: 25,
        };
        const result = await dispatch(generateMealPlan({ date, nutritionGoals: defaultGoals }));
        if (result.type === 'meal/generateMealPlan/fulfilled' && result.payload) {
          dispatch({ type: 'meal/setCurrentMealPlan', payload: result.payload });
        }
      } catch (retryError) {
        console.error('Failed to generate meal plan even with defaults:', retryError);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!currentMealPlan?._id) {
      alert('No meal plan to send. Please wait for the meal plan to be generated.');
      return;
    }

    setSendingEmail(true);
    setEmailMessage('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/mealplans/${currentMealPlan._id}/email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEmailMessage('Meal plan sent to your email successfully!');
        setTimeout(() => setEmailMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setEmailMessage(error.response?.data?.message || 'Failed to send email. Please try again.');
      setTimeout(() => setEmailMessage(''), 5000);
    } finally {
      setSendingEmail(false);
    }
  };

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const mealTypes = ['breakfast', 'lunch', 'dinner'];
  const mealIcons = { breakfast: '🌅', lunch: '🍛', dinner: '🌙' };

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
          {currentMealPlan && (
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {sendingEmail ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <span>📧</span>
                  Send to Email
                </>
              )}
            </button>
          )}
        </div>
        {emailMessage && (
          <div className={`mt-4 p-3 rounded-lg ${
            emailMessage.includes('successfully') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {emailMessage}
          </div>
        )}

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
                        {meal.items.map((item, index) => {
                          const recipeName = item.recipeName || item.foodName || item.recipeId?.name || 'Recipe';
                          const recipeInstructions = item.recipeInstructions || item.recipeId?.instructions;
                          const recipeIngredients = item.recipeIngredients || 
                            (item.recipeId ? [item.recipeId.mainIngredient, ...(item.recipeId.otherIngredients || [])] : []);
                          
                          return (
                            <div key={index} className="border-b pb-3 last:border-0">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-800">
                                    {recipeName}
                                  </p>
                                  {recipeIngredients.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Ingredients: {recipeIngredients.slice(0, 3).join(', ')}
                                      {recipeIngredients.length > 3 && '...'}
                                    </p>
                                  )}
                                  <p className="text-sm text-gray-600 mt-1">
                                    Servings: {item.quantity}x
                                  </p>
                                  {recipeInstructions && (
                                    <details className="mt-2">
                                      <summary className="text-sm text-primary-600 cursor-pointer hover:text-primary-700">
                                        View Recipe Instructions
                                      </summary>
                                      <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap bg-gray-50 p-2 rounded">
                                        {recipeInstructions}
                                      </p>
                                    </details>
                                  )}
                                </div>
                                <div className="text-right ml-4">
                                  <p className="font-semibold text-primary-600">
                                    {item.nutrition?.calories?.toFixed(0) || 0} kcal
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    P: {item.nutrition?.protein?.toFixed(1) || 0}g
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    C: {item.nutrition?.carbs?.toFixed(1) || 0}g
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    F: {item.nutrition?.fat?.toFixed(1) || 0}g
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Generating your meal plan...</h3>
          <p className="text-gray-600">
            Creating a personalized meal plan based on your Daily Tracker nutrition limits
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments...
          </p>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;

