import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRecipes, setSearchTerm } from '../store/slices/recipeSlice';
import { useTranslation } from '../Hooks/useTranslation';

const FoodDatabase = () => {
  const dispatch = useDispatch();
  const { recipes, loading, error, searchTerm } = useSelector(
    (state) => state.recipe
  );
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState('');
  const [selectedDietaryType, setSelectedDietaryType] = useState('');

  useEffect(() => {
    dispatch(fetchRecipes({ search: searchTerm, dietaryType: selectedDietaryType }));
  }, [dispatch, searchTerm, selectedDietaryType]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearch));
  };

  const dietaryTypes = [
    { value: '', label: 'All Recipes' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'non-vegetarian', label: 'Non-Vegetarian' },
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

        {/* Dietary Type Filter */}
        <div className="flex flex-wrap gap-2">
          {dietaryTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedDietaryType(type.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedDietaryType === type.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
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

      {/* Recipe Items Grid */}
      {!loading && recipes.length > 0 && (
        <>
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            Showing {recipes.length} healthy Sri Lankan recipes
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recipes.map((recipe) => (
              <div
                key={recipe._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{recipe.name}</h3>
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

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Main Ingredient: <span className="font-semibold text-primary-600 dark:text-primary-400">{recipe.mainIngredient}</span>
                    </p>
                  </div>

                  {recipe.otherIngredients && recipe.otherIngredients.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Other Ingredients:</h4>
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

                  <div className="border-t dark:border-gray-700 pt-4 mb-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Nutrition:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Calories:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{recipe.nutrition?.calories || 0} kcal</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Proteins:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{recipe.nutrition?.proteins || 0}g</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Carbohydrates:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{recipe.nutrition?.carbohydrates || 0}g</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Fat:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{recipe.nutrition?.fat || 0}g</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Fiber:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{recipe.nutrition?.fiber || 0}g</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instructions:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                      {recipe.instructions}
                    </p>
                  </div>

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-2 py-1 rounded text-xs"
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
        </>
      )}

      {/* Empty State */}
      {!loading && recipes.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">No recipes found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;

