import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchArticles, setSearchTerm, createArticle, requestEditPermission } from '../store/slices/articleSlice';
import { useTranslation } from '../Hooks/useTranslation';

const Awareness = () => {
  const dispatch = useDispatch();
  const { articles, loading, error } = useSelector((state) => state.article);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [localSearch, setLocalSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [formData, setFormData] = useState({
    topic: '',
    body: '',
    summary: '',
    photo: null,
    video: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchArticles({ search: localSearch, page: 1, limit: 20 }));
  }, [dispatch, localSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setSearchTerm(localSearch));
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!formData.topic || !formData.body) {
      alert('Please provide topic and body');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createArticle(formData)).unwrap();
      alert('Article submitted successfully! Waiting for admin approval.');
      setFormData({ topic: '', body: '', summary: '', photo: null, video: null });
      setShowAddForm(false);
      dispatch(fetchArticles({ search: localSearch, page: 1, limit: 20 }));
    } catch (error) {
      alert(error || 'Failed to create article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Health Awareness Articles
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Read and share health awareness articles
          </p>
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            + Add Article
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search articles..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Articles List - Horizontal View */}
      {!loading && articles.length > 0 && (
        <div className="space-y-6">
          {articles.map((article) => (
            <div
              key={article._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedArticle(article)}
            >
              <div className="flex flex-col md:flex-row">
                {/* Article Image/Video */}
                {(article.photo || article.video) && (
                  <div className="md:w-1/3 h-48 md:h-auto">
                    {article.photo ? (
                      <img
                        src={article.photo}
                        alt={article.topic}
                        className="w-full h-full object-cover"
                      />
                    ) : article.video ? (
                      <video
                        src={article.video}
                        className="w-full h-full object-cover"
                        controls={false}
                      />
                    ) : null}
                  </div>
                )}
                
                {/* Article Content */}
                <div className={`flex-1 p-6 ${article.photo || article.video ? '' : 'md:p-8'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 pr-4">
                      {article.topic}
                    </h3>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.summary || article.body.substring(0, 200) + '...'}
                  </p>
                  
                  {/* Article Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        By: {article.authorName || article.author?.name || 'Unknown'}
                      </span>
                      {article.isEdited && article.lastEditorName && (
                        <span className="text-xs">
                          Edited by: {article.lastEditorName}
                        </span>
                      )}
                    </div>
                    <span>{formatDate(article.createdAt)}</span>
                  </div>
                  
                  {article.viewCount > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {article.viewCount} views
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {isAuthenticated ? 'Be the first to share an article!' : 'Try adjusting your search criteria'}
          </p>
        </div>
      )}

      {/* Add Article Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddForm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Article</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleAddArticle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Topic * <span className="text-xs text-gray-500">(Title of the article)</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Enter article topic..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Body * <span className="text-xs text-gray-500">(Full article content)</span>
                </label>
                <textarea
                  required
                  rows={10}
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Write your article content here..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Summary <span className="text-xs text-gray-500">(Optional - will be auto-generated if not provided)</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  placeholder="Brief summary of the article..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Photo <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'photo')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                  {formData.photo && (
                    <p className="text-xs text-gray-500 mt-1">Selected: {formData.photo.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Video <span className="text-xs text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileChange(e, 'video')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                  {formData.video && (
                    <p className="text-xs text-gray-500 mt-1">Selected: {formData.video.name}</p>
                  )}
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Your article will be reviewed by an admin before being published.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedArticle(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 pr-4">
                {selectedArticle.topic}
              </h3>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Media */}
            {selectedArticle.photo && (
              <img
                src={selectedArticle.photo}
                alt={selectedArticle.topic}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            
            {selectedArticle.video && (
              <video
                src={selectedArticle.video}
                controls
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            
            {/* Article Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  By: {selectedArticle.authorName || selectedArticle.author?.name || 'Unknown'}
                </span>
                {selectedArticle.isEdited && selectedArticle.lastEditorName && (
                  <span className="text-xs">
                    Last edited by: {selectedArticle.lastEditorName}
                  </span>
                )}
              </div>
              <span>{formatDate(selectedArticle.createdAt)}</span>
            </div>
            
            {/* Article Body */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {selectedArticle.body}
              </p>
            </div>
            
            {/* View Count */}
            {selectedArticle.viewCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                {selectedArticle.viewCount} views
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Awareness;



