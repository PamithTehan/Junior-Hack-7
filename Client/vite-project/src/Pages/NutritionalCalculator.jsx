import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFoods } from '../store/slices/foodSlice';
import { useTranslation } from '../Hooks/useTranslation';
import { useLanguage } from '../Contexts/LanguageContext';

const NutritionalCalculator = () => {
  const dispatch = useDispatch();
  const { foods, loading } = useSelector((state) => state.food);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    dispatch(fetchFoods({ limit: 500 }));
  }, [dispatch]);

  const handleAddIngredient = (food) => {
    const existingIndex = selectedIngredients.findIndex(
      (item) => item.foodId === food._id
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
          foodId: food._id,
          foodName: food.name[language] || food.name.en,
          quantity: 1, // in servings (100g = 1 serving)
          nutrition: food.nutrition,
          servingSize: food.servingSize,
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
          protein: total.protein + (ingredient.nutrition.protein * multiplier),
          carbs: total.carbs + (ingredient.nutrition.carbs * multiplier),
          fat: total.fat + (ingredient.nutrition.fat * multiplier),
          fiber: total.fiber + (ingredient.nutrition.fiber * multiplier),
          sugar: total.sugar + (ingredient.nutrition.sugar * multiplier),
          sodium: total.sodium + (ingredient.nutrition.sodium * multiplier),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 }
    );
  };

  const totalNutrition = calculateTotalNutrition();

  // Filter foods based on search and category
  const filteredFoods = foods.filter((food) => {
    const matchesSearch =
      food.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (food.name.si && food.name.si.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (food.name.ta && food.name.ta.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !category || food.category === category;
    return matchesSearch && matchesCategory;
  });

  const categories = ['rice', 'curry', 'bread', 'snack', 'beverage', 'other'];

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
            ) : filteredFoods.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                {t('calculator.noIngredientsFound')}
              </p>
            ) : (
              filteredFoods.map((food) => (
                <div
                  key={food._id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {food.name[language] || food.name.en}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {food.nutrition.calories} kcal per {food.servingSize}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddIngredient(food)}
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
                        {ingredient.quantity} × {ingredient.servingSize}
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
                    {totalNutrition.protein.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('calculator.g')}</p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.carbs')}
                  </p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {totalNutrition.carbs.toFixed(1)}
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
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.fiber')}
                  </p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {totalNutrition.fiber.toFixed(1)}{t('calculator.g')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.sugar')}
                  </p>
                  <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                    {totalNutrition.sugar.toFixed(1)}{t('calculator.g')}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {t('calculator.sodium')}
                  </p>
                  <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                    {totalNutrition.sodium.toFixed(0)}{t('calculator.mg')}
                  </p>
                </div>
              </div>

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
    </div>
  );
};

export default NutritionalCalculator;

