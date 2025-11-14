import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFoods } from '../store/slices/foodSlice';

const Recipes = () => {
  const dispatch = useDispatch();
  const { foods, loading } = useSelector((state) => state.food);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    dispatch(fetchFoods({ limit: 100, category: selectedCategory }));
  }, [dispatch, selectedCategory]);

  // Filter foods that are traditional and have descriptions (recipes)
  const recipes = foods.filter(
    (food) => food.isTraditional && food.description && food.description.length > 50
  );

  const categories = ['rice', 'curry', 'dessert', 'snack', 'beverage', 'bread'];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Healthy Sri Lankan Recipes</h1>
        <p className="text-gray-600">
          Discover healthy and traditional Sri Lankan recipes for managing diabetes, 
          obesity, and heart disease
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Recipes
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {recipe.image && (
                <img
                  src={recipe.image}
                  alt={recipe.name.en}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{recipe.name.en}</h3>
                  <span className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-xs font-semibold capitalize">
                    {recipe.category}
                  </span>
                </div>

                {recipe.name.si && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold">Sinhala:</span> {recipe.name.si}
                  </p>
                )}
                {recipe.name.ta && (
                  <p className="text-sm text-gray-600 mb-4">
                    <span className="font-semibold">Tamil:</span> {recipe.name.ta}
                  </p>
                )}

                <p className="text-gray-700 mb-4 line-clamp-3">{recipe.description}</p>

                <div className="border-t pt-4 mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Nutrition (per {recipe.servingSize}):
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Calories:</span>
                      <span className="font-semibold ml-2">
                        {recipe.nutrition.calories} kcal
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Protein:</span>
                      <span className="font-semibold ml-2">
                        {recipe.nutrition.protein}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Carbs:</span>
                      <span className="font-semibold ml-2">
                        {recipe.nutrition.carbs}g
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Fat:</span>
                      <span className="font-semibold ml-2">
                        {recipe.nutrition.fat}g
                      </span>
                    </div>
                  </div>
                </div>

                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs"
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
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-6xl mb-4">🍛</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No recipes found</h3>
          <p className="text-gray-600">
            Try selecting a different category or check back later for more recipes
          </p>
        </div>
      )}
    </div>
  );
};

export default Recipes;

