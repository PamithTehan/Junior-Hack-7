import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addFoodToIntake } from '../store/slices/mealSlice';
import axios from 'axios';

const Scan = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [showModal, setShowModal] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for messages from iframe
    // Note: TensorFlow.js is loaded inside the iframe, not in the parent component
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SCAN_ADD_TO_TRACKER') {
        if (!token) {
          alert('Please login to add foods to your tracker');
          navigate('/login');
          return;
        }
        setScanData(event.data.data);
        setShowModal(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [token, navigate]);

  const handleAddToTracker = async () => {
    if (!scanData || !token) return;
    
    // Validation
    if (!mealType) {
      alert('Please select a meal type');
      return;
    }
    
    if (!quantity || quantity <= 0) {
      alert('Please enter a valid quantity (greater than 0)');
      return;
    }

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const today = new Date().toISOString().split('T')[0];

      const response = await axios.post(
        `${API_URL}/tracking/scan`,
        {
          foodName: scanData.foodName,
          nutrition: scanData.nutrition,
          quantity: parseFloat(quantity),
          mealType: mealType,
          date: today,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Dispatch to update Redux store
      dispatch(addFoodToIntake(response.data.data));
      
      // Reset form
      setShowModal(false);
      setScanData(null);
      setMealType('breakfast');
      setQuantity(1);
      
      // Show success message and navigate to tracker
      const mealLabels = {
        breakfast: 'Breakfast',
        lunch: 'Lunch',
        dinner: 'Dinner',
        snack: 'Snack'
      };
      
      alert(`✅ Successfully added "${scanData.foodName}" to ${mealLabels[mealType]}!`);
      navigate('/tracker');
    } catch (error) {
      console.error('Error adding to tracker:', error);
      alert(error.response?.data?.message || 'Failed to add food to tracker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <iframe
          src="/AutoFoodTracker/index.html"
          className="w-full h-screen border-0"
          title="Food Scanner"
          style={{ minHeight: 'calc(100vh - 4rem)' }}
        />
      </div>

      {/* Modal for adding to tracker */}
      {showModal && scanData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Add Scanned Food to Meal
            </h2>
            
            {/* Food Name */}
            <div className="mb-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
                🍎 {scanData.foodName}
              </p>
            </div>

            {/* Meal Type Selection - Prominent */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Meal Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'breakfast', label: 'Breakfast', icon: '🌅' },
                  { value: 'lunch', label: 'Lunch', icon: '🍛' },
                  { value: 'dinner', label: 'Dinner', icon: '🌙' },
                  { value: 'snack', label: 'Snack', icon: '🍎' },
                ].map((meal) => (
                  <button
                    key={meal.value}
                    type="button"
                    onClick={() => setMealType(meal.value)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      mealType === meal.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{meal.icon}</div>
                    <div className="font-semibold text-sm">{meal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity (servings) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={quantity}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val > 0) setQuantity(val);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>

            {/* Nutrition Information */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nutrition Information
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  Per serving × {quantity} = Total
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {scanData.nutrition.calories} × {quantity} = {(scanData.nutrition.calories * quantity).toFixed(0)} kcal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Carbohydrates:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {scanData.nutrition.carbs} × {quantity} = {(scanData.nutrition.carbs * quantity).toFixed(1)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Proteins:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {scanData.nutrition.protein} × {quantity} = {(scanData.nutrition.protein * quantity).toFixed(1)}g
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Fibers:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {scanData.nutrition.fiber} × {quantity} = {(scanData.nutrition.fiber * quantity).toFixed(1)}g
                    </span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-gray-600 dark:text-gray-400">Fat:</span>
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {scanData.nutrition.fat} × {quantity} = {(scanData.nutrition.fat * quantity).toFixed(1)}g
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setScanData(null);
                  setMealType('breakfast');
                  setQuantity(1);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddToTracker}
                disabled={loading || !mealType || !quantity || quantity <= 0}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Scan;

