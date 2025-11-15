import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecipes, setSearchTerm } from '../store/slices/recipeSlice';

const Recipes = () => {
  const dispatch = useDispatch();
  const { recipes, loading, error, searchTerm } = useSelector((state) => state.recipe);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedDietaryType, setSelectedDietaryType] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedNutritionFilter, setSelectedNutritionFilter] = useState('');

  useEffect(() => {
    dispatch(fetchRecipes({ 
      search: searchTerm, 
      dietaryType: selectedDietaryType,
      tag: selectedTag,
      nutritionFilter: selectedNutritionFilter
    }));
  }, [dispatch, searchTerm, selectedDietaryType, selectedTag, selectedNutritionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearch));
  };

  // Get unique tags from all recipes
  const allTags = Array.from(
    new Set(
      recipes.flatMap(recipe => recipe.tags || [])
    )
  ).sort();

  const dietaryTypes = [
    { value: '', label: 'All Dietary Types' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian' },
  ];

  const nutritionFilters = [
    { value: '', label: 'All Nutrition Types' },
    { value: 'low-calorie', label: 'Low Calorie (< 200 kcal)' },
    { value: 'high-protein', label: 'High Protein (> 15g)' },
    { value: 'low-carb', label: 'Low Carb (< 30g)' },
    { value: 'high-fiber', label: 'High Fiber (> 5g)' },
    { value: 'low-fat', label: 'Low Fat (< 10g)' },
    { value: 'balanced', label: 'Balanced Nutrition' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Healthy Sri Lankan Recipes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Discover healthy and traditional Sri Lankan recipes
        </p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search healthy Sri Lankan recipes..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Dietary Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dietary Type
            </label>
            <select
              value={selectedDietaryType}
              onChange={(e) => setSelectedDietaryType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {dietaryTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Special Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Special Tags
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">All Tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag.charAt(0).toUpperCase() + tag.slice(1).replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Nutrition Content Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nutrition Content
            </label>
            <select
              value={selectedNutritionFilter}
              onChange={(e) => setSelectedNutritionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {nutritionFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedDietaryType || selectedTag || selectedNutritionFilter) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
              {selectedDietaryType && (
                <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded-full text-sm flex items-center gap-2">
                  {dietaryTypes.find(t => t.value === selectedDietaryType)?.label}
                  <button
                    onClick={() => setSelectedDietaryType('')}
                    className="hover:text-primary-600 dark:hover:text-primary-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedTag && (
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm flex items-center gap-2">
                  {selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1).replace(/-/g, ' ')}
                  <button
                    onClick={() => setSelectedTag('')}
                    className="hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedNutritionFilter && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm flex items-center gap-2">
                  {nutritionFilters.find(f => f.value === selectedNutritionFilter)?.label}
                  <button
                    onClick={() => setSelectedNutritionFilter('')}
                    className="hover:text-green-600 dark:hover:text-green-400"
                  >
                    ×
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedDietaryType('');
                  setSelectedTag('');
                  setSelectedNutritionFilter('');
                }}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Recipes Grid */}
      {!loading && !error && recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        {recipe.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        recipe.dietaryType === 'vegan' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : recipe.dietaryType === 'vegetarian'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      }`}>
                        {recipe.dietaryType || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Main Ingredient:
                      </span>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">
                        {recipe.mainIngredient}
                      </span>
                    </div>
                  </div>

                {/* Other Ingredients */}
                {recipe.otherIngredients && recipe.otherIngredients.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Other Ingredients:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recipe.otherIngredients.map((ingredient, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                        >
                          {ingredient}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Nutrition Information */}
                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Nutrition:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                      <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">
                        {recipe.nutrition?.calories || 0} kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Proteins:</span>
                      <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">
                        {recipe.nutrition?.proteins || 0}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Carbohydrates:</span>
                      <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">
                        {recipe.nutrition?.carbohydrates || 0}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fat:</span>
                      <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">
                        {recipe.nutrition?.fat || 0}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Fiber:</span>
                      <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">
                        {recipe.nutrition?.fiber || 0}g
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Instructions:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                    {recipe.instructions}
                  </p>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && recipes.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Recipes;
