import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  fetchDailyIntake,
  addFoodToIntake,
  removeFoodFromIntake,
} from '../store/slices/mealSlice';
import { fetchFoods } from '../store/slices/foodSlice';
import { useSocket } from '../Contexts/SocketContext';
import { format } from 'date-fns';

const FoodTracker = () => {
  const dispatch = useDispatch();
  const { currentDailyIntake, loading } = useSelector((state) => state.meal);
  const { foods } = useSelector((state) => state.food);
  const { socket, isConnected } = useSocket();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddForm, setShowAddForm] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();

  const selectedFoodId = watch('foodId');

  useEffect(() => {
    dispatch(fetchDailyIntake(selectedDate));
    dispatch(fetchFoods({ limit: 100 }));
  }, [dispatch, selectedDate]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleFoodAdded = (data) => {
      // Refresh intake if it's for the current date
      if (data.intake && new Date(data.intake.date).toISOString().split('T')[0] === selectedDate) {
        dispatch(fetchDailyIntake(selectedDate));
      }
    };

    const handleFoodRemoved = (data) => {
      // Refresh intake if it's for the current date
      if (data.intake && new Date(data.intake.date).toISOString().split('T')[0] === selectedDate) {
        dispatch(fetchDailyIntake(selectedDate));
      }
    };

    socket.on('food:added', handleFoodAdded);
    socket.on('food:removed', handleFoodRemoved);

    return () => {
      socket.off('food:added', handleFoodAdded);
      socket.off('food:removed', handleFoodRemoved);
    };
  }, [socket, isConnected, selectedDate, dispatch]);

  const onSubmit = async (data) => {
    const foodData = {
      foodId: data.foodId,
      quantity: parseFloat(data.quantity),
      mealType: data.mealType,
      date: selectedDate,
    };
    dispatch(addFoodToIntake(foodData));
    setShowAddForm(false);
    reset();
  };

  const handleRemoveFood = (intakeId, foodItemId) => {
    if (window.confirm('Are you sure you want to remove this food item?')) {
      // Ensure both IDs are strings
      dispatch(removeFoodFromIntake({ 
        intakeId: String(intakeId), 
        foodItemId: String(foodItemId) 
      }));
    }
  };

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealIcons = { breakfast: '🌅', lunch: '🍛', dinner: '🌙', snack: '🍎' };

  const selectedFood = foods.find((f) => f._id === selectedFoodId);

  // Group foods by meal type
  const foodsByMeal = mealTypes.reduce((acc, mealType) => {
    acc[mealType] =
      currentDailyIntake?.foods?.filter((f) => f.mealType === mealType) || [];
    return acc;
  }, {});

  const calculateMealTotal = (mealFoods) => {
    return mealFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.nutrition?.calories || 0),
        protein: acc.protein + (food.nutrition?.protein || 0),
        carbs: acc.carbs + (food.nutrition?.carbs || 0),
        fat: acc.fat + (food.nutrition?.fat || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Food Tracker</h1>
        <p className="text-gray-600">
          Track your daily food intake and monitor your nutrition
        </p>
      </div>

      {/* Date Selection and Add Button */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between">
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Food'}
          </button>
        </div>
      </div>

      {/* Add Food Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add Food to Log</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Item
                </label>
                <select
                  {...register('foodId', { required: 'Please select a food' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select food...</option>
                  {foods.map((food) => (
                    <option key={food._id} value={food._id}>
                      {food.name.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (servings)
                </label>
                <input
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: { value: 0.1, message: 'Must be at least 0.1' },
                  })}
                  type="number"
                  step="0.1"
                  min="0.1"
                  defaultValue="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="1.0"
                />
                {selectedFood && (
                  <p className="text-xs text-gray-500 mt-1">
                    Serving size: {selectedFood.servingSize}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <select
                  {...register('mealType', { required: 'Please select a meal type' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select meal...</option>
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedFood && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Nutrition per serving:
                </p>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Calories:</span>
                    <span className="font-semibold ml-2">
                      {selectedFood.nutrition.calories} kcal
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Protein:</span>
                    <span className="font-semibold ml-2">
                      {selectedFood.nutrition.protein}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Carbs:</span>
                    <span className="font-semibold ml-2">
                      {selectedFood.nutrition.carbs}g
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Fat:</span>
                    <span className="font-semibold ml-2">
                      {selectedFood.nutrition.fat}g
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add to Log
            </button>
          </form>
        </div>
      )}

      {/* Daily Summary */}
      {currentDailyIntake && (
        <div className="bg-primary-50 rounded-lg p-6 mb-8 border border-primary-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Daily Summary - {format(new Date(selectedDate), 'MMMM d, yyyy')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Calories</p>
              <p className="text-2xl font-bold text-primary-600">
                {currentDailyIntake.totalNutrition?.calories?.toFixed(0) || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Protein</p>
              <p className="text-2xl font-bold text-blue-600">
                {currentDailyIntake.totalNutrition?.protein?.toFixed(0) || 0}g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Carbs</p>
              <p className="text-2xl font-bold text-orange-600">
                {currentDailyIntake.totalNutrition?.carbs?.toFixed(0) || 0}g
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fat</p>
              <p className="text-2xl font-bold text-purple-600">
                {currentDailyIntake.totalNutrition?.fat?.toFixed(0) || 0}g
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Meals by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mealTypes.map((mealType) => {
          const mealFoods = foodsByMeal[mealType];
          const mealTotal = calculateMealTotal(mealFoods);

          return (
            <div key={mealType} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">{mealIcons[mealType]}</span>
                  <h3 className="text-xl font-bold text-gray-800 capitalize">
                    {mealType}
                  </h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary-600">
                    {mealTotal.calories.toFixed(0)} kcal
                  </p>
                </div>
              </div>

              {mealFoods.length > 0 ? (
                <>
                  <div className="space-y-3 mb-4">
                    {mealFoods.map((food, index) => {
                      // Use the subdocument _id (convert to string), fallback to index for backwards compatibility
                      // Note: food._id is the subdocument ID, not food.foodId (which is the FoodItem reference)
                      const foodItemId = food._id ? String(food._id) : (food.id ? String(food.id) : index);
                      
                      // Debug logging
                      if (index === 0) {
                        console.log('Food item structure:', {
                          _id: food._id,
                          id: food.id,
                          foodId: food.foodId,
                          foodName: food.foodName,
                          computedFoodItemId: foodItemId
                        });
                      }
                      
                      return (
                        <div
                          key={foodItemId}
                          className="border-b pb-3 last:border-0 flex justify-between items-start"
                        >
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                              {food.foodName}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Quantity: {food.quantity}x |{' '}
                              {food.nutrition?.calories?.toFixed(0) || 0} kcal
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              console.log('Removing food:', { 
                                intakeId: currentDailyIntake._id, 
                                foodItemId,
                                foodData: { _id: food._id, foodId: food.foodId, foodName: food.foodName }
                              });
                              handleRemoveFood(currentDailyIntake._id, foodItemId);
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 ml-4 font-bold text-xl"
                            title="Remove food"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <p className="text-gray-600">
                      Total: {mealTotal.calories.toFixed(0)} kcal | P:{' '}
                      {mealTotal.protein.toFixed(0)}g | C: {mealTotal.carbs.toFixed(0)}g | F:{' '}
                      {mealTotal.fat.toFixed(0)}g
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 italic text-center py-4">
                  No foods logged for {mealType}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {!currentDailyIntake && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No foods logged</h3>
          <p className="text-gray-600">
            Start tracking your meals by clicking "Add Food"
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodTracker;

