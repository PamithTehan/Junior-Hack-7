import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIngredients } from '../store/slices/ingredientSlice';
import { addFoodToIntake, fetchDailyIntake } from '../store/slices/mealSlice';
import { useTranslation } from '../Hooks/useTranslation';
import { useLanguage } from '../Contexts/LanguageContext';
import { format } from 'date-fns';

const NutritionalCalculator = () => {
  const dispatch = useDispatch();
  const { ingredients, loading } = useSelector((state) => state.ingredient);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { currentDailyIntake, loading: intakeLoading } = useSelector((state) => state.meal);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [savingMeal, setSavingMeal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(fetchIngredients({ limit: 500 }));
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDailyIntake(selectedDate));
    }
  }, [dispatch, isAuthenticated, selectedDate]);

  const handleAddIngredient = (ingredient) => {
    const existingIndex = selectedIngredients.findIndex(
      (item) => item.foodId === ingredient._id
    );

    if (existingIndex >= 0) {
      // Update quantity if already added
      const updated = [...selectedIngredients];
      updated[existingIndex].quantity += 1;
      setSelectedIngredients(updated);
    } else {
      // Add new ingredient
      setSelectedIngredients([
        ...selectedIngredients,
        {
          foodId: ingredient._id,
          foodName: ingredient.name,
          quantity: 1, // in servings (100g = 1 serving)
          nutrition: ingredient.nutrition,
        },
      ]);
    }
  };

  const handleRemoveIngredient = (index) => {
    setSelectedIngredients(selectedIngredients.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updated = [...selectedIngredients];
    updated[index].quantity = Math.max(0.1, parseFloat(newQuantity) || 0.1);
    setSelectedIngredients(updated);
  };

  const calculateTotalNutrition = () => {
    return selectedIngredients.reduce(
      (total, ingredient) => {
        const multiplier = ingredient.quantity;
        return {
          calories: total.calories + (ingredient.nutrition.calories * multiplier),
          proteins: total.proteins + (ingredient.nutrition.proteins * multiplier),
          carbohydrates: total.carbohydrates + (ingredient.nutrition.carbohydrates * multiplier),
          fat: total.fat + (ingredient.nutrition.fat * multiplier),
          fiber: total.fiber + (ingredient.nutrition.fiber * multiplier),
        };
      },
      { calories: 0, proteins: 0, carbohydrates: 0, fat: 0, fiber: 0 }
    );
  };

  const totalNutrition = calculateTotalNutrition();

  const handleSaveMeal = async () => {
    if (selectedIngredients.length === 0) {
      alert(t('calculator.noIngredientsToSave'));
      return;
    }

    if (!isAuthenticated) {
      alert(t('calculator.loginRequired'));
      return;
    }

    setSavingMeal(true);
    try {
      // Save each ingredient as a separate food item in the meal
      for (const ingredient of selectedIngredients) {
        await dispatch(
          addFoodToIntake({
            foodId: ingredient.foodId,
            quantity: ingredient.quantity,
            mealType: selectedMealType,
            date: selectedDate,
          })
        ).unwrap();
      }
      
      // Clear selected ingredients after saving
      setSelectedIngredients([]);
      
      // Refresh daily intake
      dispatch(fetchDailyIntake(selectedDate));
    } catch (error) {
      console.error('Error saving meal:', error);
      alert(t('calculator.saveError'));
    } finally {
      setSavingMeal(false);
    }
  };

  // Group saved meals by meal type
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealIcons = { breakfast: '🌅', lunch: '🍛', dinner: '🌙', snack: '🍎' };
  
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

  // Filter ingredients based on search and category
  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !category || ingredient.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['vegetables', 'fruits', 'grains', 'proteins', 'dairy', 'nuts', 'legumes', 'other'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('calculator.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('calculator.description')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Ingredient Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('calculator.selectIngredients')}
          </h2>

          {/* Search and Filter */}
          <div className="mb-4 space-y-3">
            <input
              type="text"
              placeholder={t('calculator.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="">{t('calculator.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Ingredients List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : filteredIngredients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('calculator.noIngredientsFound')}
              </p>
            ) : (
              filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient._id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {ingredient.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {ingredient.nutrition.calories} kcal per 100g
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddIngredient(ingredient)}
                    className="ml-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    + {t('calculator.add')}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Selected Ingredients & Total */}
        <div className="space-y-6">
          {/* Selected Ingredients */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {t('calculator.selectedIngredients')} ({selectedIngredients.length})
            </h2>

            {selectedIngredients.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('calculator.noIngredients')}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {ingredient.foodName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(ingredient.nutrition.calories * ingredient.quantity).toFixed(1)} kcal
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-700 dark:text-gray-100"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ingredient.quantity} × 100g
                      </span>
                      <button
                        onClick={() => handleRemoveIngredient(index)}
                        className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Total Nutrition */}
          {selectedIngredients.length > 0 && (
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800 rounded-lg shadow-md p-6 border border-primary-200 dark:border-primary-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                {t('calculator.totalNutrition')}
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.calories')}
                  </p>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {totalNutrition.calories.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.kcal')}</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.protein')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalNutrition.proteins.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.g')}</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.carbs')}
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {totalNutrition.carbohydrates.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.g')}</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.fat')}
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {totalNutrition.fat.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.g')}</p>
                </div>
              </div>

              {/* Additional Nutrients */}
              <div className="grid grid-cols-1 gap-3 mt-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.fiber')}
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {totalNutrition.fiber.toFixed(1)}{t('calculator.g')}
                  </p>
                </div>
              </div>

              {/* Meal Type Selector and Save Button */}
              {isAuthenticated && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('calculator.mealType')}
                    </label>
                    <select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      {mealTypes.map((type) => (
                        <option key={type} value={type}>
                          {mealIcons[type]} {t(`tracker.mealTypes.${type}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('calculator.date')}
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <button
                    onClick={handleSaveMeal}
                    disabled={savingMeal || selectedIngredients.length === 0}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {savingMeal ? t('calculator.saving') : t('calculator.saveMeal')}
                  </button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                    {t('calculator.loginToSave')}
                  </p>
                </div>
              )}

              {/* Clear Button */}
              <button
                onClick={() => setSelectedIngredients([])}
                className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                {t('calculator.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Saved Meals Section */}
      {isAuthenticated && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            {t('calculator.savedMeals')}
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('calculator.viewDate')}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          {intakeLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mealTypes.map((mealType) => {
                const mealFoods = foodsByMeal[mealType];
                const mealTotal = calculateMealTotal(mealFoods);

                return (
                  <div
                    key={mealType}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
                  >
                    <div className="flex items-center mb-4">
                      <span className="text-3xl mr-3">{mealIcons[mealType]}</span>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 capitalize">
                        {t(`tracker.mealTypes.${mealType}`)}
                      </h3>
                    </div>

                    {mealFoods.length > 0 ? (
                      <>
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                          {mealFoods.map((food, index) => (
                            <div
                              key={food._id || index}
                              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800 dark:text-gray-100">
                                  {food.foodName}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {food.quantity} × serving
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                  {(food.nutrition?.calories || 0).toFixed(0)} kcal
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {t('calculator.total')}: {mealTotal.calories.toFixed(0)} kcal | P:{' '}
                            {(mealTotal.protein || 0).toFixed(0)}g | C: {(mealTotal.carbs || 0).toFixed(0)}g | F:{' '}
                            {mealTotal.fat.toFixed(0)}g
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        {t('calculator.noFoodsMeal', { mealType: t(`tracker.mealTypes.${mealType}`) })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NutritionalCalculator;

