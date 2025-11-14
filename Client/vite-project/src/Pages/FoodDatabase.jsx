import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchFoods, setSearchTerm, setCategory, setCurrentPage } from '../store/slices/foodSlice';
import { useTranslation } from '../Hooks/useTranslation';
import { useLanguage } from '../Contexts/LanguageContext';

const FoodDatabase = () => {
  const dispatch = useDispatch();
  const { foods, loading, error, searchTerm, category, currentPage, total } = useSelector(
    (state) => state.food
  );
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [localSearch, setLocalSearch] = useState('');

  // Helper function to get food name based on language
  const getFoodName = (food) => {
    if (language === 'si' && food.name?.si) return food.name.si;
    if (language === 'ta' && food.name?.ta) return food.name.ta;
    return food.name?.en || 'Food Item';
  };

  useEffect(() => {
    dispatch(fetchFoods({ search: searchTerm, category, page: currentPage }));
  }, [dispatch, searchTerm, category, currentPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearch));
    dispatch(setCurrentPage(1));
  };

  const categories = ['rice', 'curry', 'dessert', 'snack', 'beverage', 'bread', 'other'];
  
  // Helper function to get category name
  const getCategoryName = (cat) => {
    return t(`food.categories.${cat}`) || cat;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('food.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('food.description')}
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
              placeholder={t('food.searchPlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('food.search')}
            </button>
          </div>
        </form>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              dispatch(setCategory(''));
              dispatch(setCurrentPage(1));
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              category === ''
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {t('food.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                dispatch(setCategory(cat));
                dispatch(setCurrentPage(1));
              }}
              className={`px-4 py-2 rounded-lg transition-colors ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {getCategoryName(cat)}
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

      {/* Food Items Grid */}
      {!loading && foods.length > 0 && (
        <>
          <div className="mb-4 text-gray-600 dark:text-gray-400">
            {t('food.showing')} {foods.length} {t('food.of')} {total} {t('food.foods')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {foods.map((food) => (
              <div
                key={food._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {food.image && (
                  <img
                    src={food.image}
                    alt={getFoodName(food)}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getFoodName(food)}</h3>
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-xs font-semibold">
                      {getCategoryName(food.category)}
                    </span>
                  </div>
                  {language === 'en' && food.name?.si && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {t('food.sinhala')}: {food.name.si}
                    </p>
                  )}
                  {language === 'en' && food.name?.ta && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {t('food.tamil')}: {food.name.ta}
                    </p>
                  )}

                  <div className="border-t dark:border-gray-700 pt-4">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('food.nutrition')} ({t('food.per')} {food.servingSize}):</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t('food.calories')}:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{food.nutrition.calories} kcal</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t('food.protein')}:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{food.nutrition.protein}g</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t('food.carbs')}:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{food.nutrition.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">{t('food.fat')}:</span>
                        <span className="font-semibold ml-2 text-gray-800 dark:text-gray-100">{food.nutrition.fat}g</span>
                      </div>
                    </div>
                  </div>

                  {food.tags && food.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {food.tags.map((tag, index) => (
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

          {/* Pagination */}
          {total > foods.length && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => dispatch(setCurrentPage(Math.max(1, currentPage - 1)))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                {t('food.previous')}
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                {t('food.page')} {currentPage} {t('food.of')} {Math.ceil(total / 20)}
              </span>
              <button
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                disabled={currentPage >= Math.ceil(total / 20)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              >
                {t('food.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && foods.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('food.noFoods')}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('food.tryAgain')}
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodDatabase;

