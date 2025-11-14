import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { adminLogout, getAdminMe } from '../../store/slices/adminSlice';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { admin } = useSelector((state) => state.admin);
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [foods, setFoods] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [articles, setArticles] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search and filter states
  const [foodSearch, setFoodSearch] = useState('');
  const [foodType, setFoodType] = useState('');
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeCategory, setRecipeCategory] = useState('');
  const [articleSearch, setArticleSearch] = useState('');
  const [articleStatus, setArticleStatus] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [editArticleData, setEditArticleData] = useState({
    topic: '',
    body: '',
    summary: '',
    photo: null,
    video: null,
  });
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [newFood, setNewFood] = useState({
    name: { en: '' },
    type: '',
    nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
    servingSize: '100g',
    image: null,
  });

  const foodTypes = ['fruits', 'vegetables', 'grains', 'proteins', 'dairy', 'beverages', 'nuts-seeds', 'legumes', 'herbs', 'other'];
  const recipeCategories = ['rice', 'curry', 'dessert', 'snack', 'beverage', 'bread', 'other'];

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/admin/users`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (foodSearch) params.append('search', foodSearch);
      if (foodType) params.append('type', foodType);
      params.append('limit', '100');
      
      const response = await axios.get(`${API_URL}/foods?${params.toString()}`);
      setFoods(response.data.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  }, [foodSearch, foodType]);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (recipeSearch) params.append('search', recipeSearch);
      if (recipeCategory) params.append('category', recipeCategory);
      params.append('limit', '100');
      
      const response = await axios.get(`${API_URL}/recipes?${params.toString()}`);
      setRecipes(response.data.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);
    }
  }, [recipeSearch, recipeCategory]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (articleSearch) params.append('search', articleSearch);
      if (articleStatus) params.append('status', articleStatus);
      params.append('limit', '100');
      
      const response = await axios.get(`${API_URL}/articles/admin/all?${params.toString()}`);
      setArticles(response.data.data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  }, [articleSearch, articleStatus]);

  const fetchAllAdmins = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/all-admins`);
      setAllAdmins(response.data.data);
    } catch (error) {
      console.error('Error fetching all admins:', error);
    }
  };

  useEffect(() => {
    dispatch(getAdminMe());
    fetchStats();
  }, [dispatch]);

  // Debug: Log admin role
  useEffect(() => {
    if (admin) {
      console.log('Admin Dashboard - Admin object:', admin);
      console.log('Admin Dashboard - Admin role:', admin.role);
    }
  }, [admin]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'foods') fetchFoods();
    if (activeTab === 'recipes') fetchRecipes();
    if (activeTab === 'articles') fetchArticles();
    if (activeTab === 'admin-management' && admin?.role === 'master') fetchAllAdmins();
  }, [activeTab, admin?.role, fetchFoods, fetchRecipes, fetchArticles]);

  useEffect(() => {
    if (activeTab === 'foods') {
      const timeoutId = setTimeout(() => {
        fetchFoods();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchFoods]);

  useEffect(() => {
    if (activeTab === 'recipes') {
      const timeoutId = setTimeout(() => {
        fetchRecipes();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchRecipes]);

  useEffect(() => {
    if (activeTab === 'articles') {
      const timeoutId = setTimeout(() => {
        fetchArticles();
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [activeTab, fetchArticles]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      alert('Error deleting user: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteFood = async (foodId) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      await axios.delete(`${API_URL}/foods/${foodId}`);
      fetchFoods();
      alert('Food item deleted successfully');
    } catch (error) {
      alert('Error deleting food: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', JSON.stringify({
        en: newFood.name.en,
        si: newFood.name.en,
        ta: newFood.name.en,
      }));
      formData.append('type', newFood.type);
      formData.append('nutrition', JSON.stringify({
        ...newFood.nutrition,
        sugar: 0,
        sodium: 0,
      }));
      formData.append('servingSize', newFood.servingSize);
      if (newFood.image) {
        formData.append('image', newFood.image);
      }

      await axios.post(`${API_URL}/foods`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Food added successfully!');
      setShowAddFoodModal(false);
      setNewFood({
        name: { en: '' },
        type: '',
        nutrition: { calories: 0, protein: 0, carbohydrates: 0, fat: 0, fiber: 0 },
        servingSize: '100g',
        image: null,
      });
      fetchFoods();
    } catch (error) {
      alert('Error adding food: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await axios.delete(`${API_URL}/recipes/${recipeId}`);
      fetchRecipes();
      alert('Recipe deleted successfully');
    } catch (error) {
      alert('Error deleting recipe: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveRecipe = async (recipeId) => {
    try {
      await axios.put(`${API_URL}/admin/recipes/${recipeId}/approve`);
      fetchRecipes();
      alert('Recipe approved successfully');
    } catch (error) {
      alert('Error approving recipe: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveArticle = async (articleId) => {
    try {
      await axios.put(`${API_URL}/articles/${articleId}/approve`);
      fetchArticles();
      alert('Article approved successfully');
    } catch (error) {
      alert('Error approving article: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;
    try {
      await axios.delete(`${API_URL}/articles/${articleId}`);
      fetchArticles();
      alert('Article deleted successfully');
    } catch (error) {
      alert('Error deleting article: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditArticle = (article) => {
    setSelectedArticle(article);
    setEditArticleData({
      topic: article.topic,
      body: article.body,
      summary: article.summary || '',
      photo: null,
      video: null,
    });
    setShowEditArticleModal(true);
  };

  const handleSaveArticleEdit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('topic', editArticleData.topic);
      formData.append('body', editArticleData.body);
      if (editArticleData.summary) formData.append('summary', editArticleData.summary);
      if (editArticleData.photo) formData.append('photo', editArticleData.photo);
      if (editArticleData.video) formData.append('video', editArticleData.video);

      await axios.put(`${API_URL}/articles/${selectedArticle._id}/admin-edit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchArticles();
      alert('Article edited successfully');
      setShowEditArticleModal(false);
      setSelectedArticle(null);
    } catch (error) {
      alert('Error editing article: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveEditRequest = async (articleId, requestId) => {
    try {
      await axios.put(`${API_URL}/articles/${articleId}/approve-edit/${requestId}`);
      fetchArticles();
      alert('Edit request approved successfully');
    } catch (error) {
      alert('Error approving edit request: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveAdmin = async (adminId) => {
    try {
      await axios.put(`${API_URL}/admin/approve/${adminId}`);
      fetchAllAdmins();
      alert('Admin approved successfully');
    } catch (error) {
      alert('Error approving admin: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRemoveAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to remove this admin?')) return;
    try {
      await axios.delete(`${API_URL}/admin/${adminId}`);
      fetchAllAdmins();
      alert('Admin removed successfully');
    } catch (error) {
      alert('Error removing admin: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    dispatch(adminLogout());
    navigate('/admin/login');
  };


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Administration Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {admin?.adminId || admin?.role === 'master' ? `ID: ${admin?.adminId || 'MS-0001'}` : ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md mb-6">
          <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'stats'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'users'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('foods')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'foods'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              Foods
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              Recipes
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
              }`}
            >
              Articles
              {articles.filter(a => !a.isApproved).length > 0 && (
                <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {articles.filter(a => !a.isApproved).length}
                </span>
              )}
            </button>
            {admin?.role === 'master' && (
              <button
                onClick={() => setActiveTab('admin-management')}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === 'admin-management'
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-primary-600'
                }`}
              >
                Admin Management
                {allAdmins.filter(a => !a.isApproved).length > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {allAdmins.filter(a => !a.isApproved).length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalUsers}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Foods</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalFoods}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <span className="text-2xl">🍛</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Recipes</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.totalRecipes}</p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
                  <span className="text-2xl">📖</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approvals</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{stats.pendingApprovals}</p>
                </div>
                <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">User Management</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">User ID</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Role</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user._id} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{user.userId || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          {user.name || `${user.firstName} ${user.lastName}`}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{user.email}</td>
                        <td className="py-3 px-4">
                          {user.role === 'master' ? (
                            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-semibold">
                              Master (Site Owner)
                            </span>
                          ) : (
                            <span className="text-gray-600 dark:text-gray-400">User</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {user.role !== 'master' && (
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          )}
                          {user.role === 'master' && (
                            <span className="text-gray-400 dark:text-gray-500 text-sm italic">Protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Foods Tab */}
        {activeTab === 'foods' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Foods Management</h2>
              <button
                onClick={() => setShowAddFoodModal(true)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Food
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search foods..."
                  value={foodSearch}
                  onChange={(e) => setFoodSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Types</option>
                  {foodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Type</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Calories</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {foods.map((food) => (
                      <tr key={food._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          <div className="flex items-center space-x-2">
                            <span>{food.name?.en || food.name}</span>
                            <button
                              onClick={() => setSelectedFood(food)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          {food.type ? food.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{food.nutrition?.calories || 0} kcal</td>
                        <td className="py-3 px-4">
                          {food.isApproved === false ? (
                            <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Approved</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => navigate(`/foods/${food._id}`)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteFood(food._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {foods.length === 0 && (
                  <p className="text-center py-8 text-gray-600 dark:text-gray-400">No foods found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Recipes Management</h2>
              <button
                onClick={() => navigate('/foods')}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Recipe
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={recipeSearch}
                  onChange={(e) => setRecipeSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <select
                  value={recipeCategory}
                  onChange={(e) => setRecipeCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Categories</option>
                  {recipeCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Name</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Category</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Calories</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipes.map((recipe) => (
                      <tr key={recipe._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          <div className="flex items-center space-x-2">
                            <span>{recipe.name?.en || recipe.name}</span>
                            <button
                              onClick={() => setSelectedRecipe(recipe)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="View Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{recipe.category}</td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{recipe.nutrition?.calories || 0} kcal</td>
                        <td className="py-3 px-4">
                          {recipe.isApproved === false ? (
                            <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Approved</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {recipe.isApproved === false && (
                              <button
                                onClick={() => handleApproveRecipe(recipe._id)}
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => navigate(`/foods/${recipe._id}`)}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(recipe._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recipes.length === 0 && (
                  <p className="text-center py-8 text-gray-600 dark:text-gray-400">No recipes found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Articles Management</h2>
            </div>
            
            {/* Search and Filter */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={articleSearch}
                  onChange={(e) => setArticleSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
              <div>
                <select
                  value={articleStatus}
                  onChange={(e) => setArticleStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="">All Articles</option>
                  <option value="pending">Pending Approval</option>
                  <option value="approved">Approved</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Topic</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Author</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Created</th>
                      <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => (
                      <tr key={article._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{article.topic}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          {article.authorName || article.author?.name || 'Unknown'}
                        </td>
                        <td className="py-3 px-4">
                          {article.isApproved === false ? (
                            <span className="text-yellow-600 dark:text-yellow-400">Pending</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Approved</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                          {new Date(article.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            {article.isApproved === false && (
                              <>
                                <button
                                  onClick={() => handleEditArticle(article)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                                >
                                  Edit Before Approve
                                </button>
                                <button
                                  onClick={() => handleApproveArticle(article._id)}
                                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors text-sm"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            {article.isApproved && (
                              <button
                                onClick={() => handleEditArticle(article)}
                                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm"
                              >
                                Edit
                              </button>
                            )}
                            {article.editRequests && article.editRequests.filter(req => !req.approved).length > 0 && (
                              <button
                                onClick={() => {
                                  const pendingReq = article.editRequests.find(req => !req.approved);
                                  if (pendingReq) {
                                    handleApproveEditRequest(article._id, pendingReq._id);
                                  }
                                }}
                                className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors text-sm"
                                title="Approve Edit Request"
                              >
                                Approve Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteArticle(article._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {articles.length === 0 && (
                  <p className="text-center py-8 text-gray-600 dark:text-gray-400">No articles found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin Management Tab (Master only) */}
        {activeTab === 'admin-management' && admin?.role === 'master' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Admin Management</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage admin accounts. Approve pending admin registrations or remove existing admins. Only master (site owner) can access this section.
              </p>
            </div>

            {allAdmins.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-8">No admins found</p>
            ) : (
              <>
                {/* Pending Admins Section */}
                {allAdmins.filter(a => !a.isApproved).length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                      <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-sm mr-2">
                        Pending Approval ({allAdmins.filter(a => !a.isApproved).length})
                      </span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Admin ID</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Name</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Registered</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAdmins
                            .filter(adminItem => !adminItem.isApproved)
                            .map((adminItem) => (
                              <tr key={adminItem._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{adminItem.adminId || 'N/A'}</td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                                  {adminItem.firstName} {adminItem.lastName}
                                </td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{adminItem.email}</td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                                  {adminItem.createdAt ? new Date(adminItem.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleApproveAdmin(adminItem._id)}
                                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleRemoveAdmin(adminItem._id)}
                                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Approved Admins Section */}
                {allAdmins.filter(a => a.isApproved).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm mr-2">
                        Approved Admins ({allAdmins.filter(a => a.isApproved).length})
                      </span>
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Admin ID</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Name</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Email</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Approved Date</th>
                            <th className="text-left py-3 px-4 text-gray-700 dark:text-gray-300">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allAdmins
                            .filter(adminItem => adminItem.isApproved)
                            .map((adminItem) => (
                              <tr key={adminItem._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{adminItem.adminId || 'N/A'}</td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                                  {adminItem.firstName} {adminItem.lastName}
                                </td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">{adminItem.email}</td>
                                <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                                  {adminItem.approvedAt ? new Date(adminItem.approvedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="py-3 px-4">
                                  <button
                                    onClick={() => handleRemoveAdmin(adminItem._id)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Food Details Modal */}
        {selectedFood && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedFood(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedFood.name?.en || selectedFood.name}</h3>
                <button onClick={() => setSelectedFood(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedFood.image && (
                <img src={selectedFood.image} alt={selectedFood.name?.en} className="w-full h-64 object-cover rounded-lg mb-4" />
              )}
              <div className="space-y-2">
                <p><strong>Type:</strong> {selectedFood.type ? selectedFood.type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}</p>
                <p><strong>Description:</strong> {selectedFood.description || 'N/A'}</p>
                <p><strong>Serving Size:</strong> {selectedFood.servingSize}</p>
                <div className="mt-4">
                  <strong>Nutrition (per {selectedFood.servingSize}):</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>Calories: {selectedFood.nutrition?.calories || 0} kcal</li>
                    <li>Protein: {selectedFood.nutrition?.protein || 0} g</li>
                    <li>Carbohydrates: {selectedFood.nutrition?.carbohydrates || 0} g</li>
                    <li>Fat: {selectedFood.nutrition?.fat || 0} g</li>
                    <li>Fiber: {selectedFood.nutrition?.fiber || 0} g</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Details Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedRecipe(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedRecipe.name?.en || selectedRecipe.name}</h3>
                <button onClick={() => setSelectedRecipe(null)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {selectedRecipe.image && (
                <img src={selectedRecipe.image} alt={selectedRecipe.name?.en} className="w-full h-64 object-cover rounded-lg mb-4" />
              )}
              <div className="space-y-2">
                <p><strong>Category:</strong> {selectedRecipe.category}</p>
                <p><strong>Description:</strong> {selectedRecipe.description || 'N/A'}</p>
                <p><strong>Serving Size:</strong> {selectedRecipe.servingSize}</p>
                <div className="mt-4">
                  <strong>Nutrition (per {selectedRecipe.servingSize}):</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>Calories: {selectedRecipe.nutrition?.calories || 0} kcal</li>
                    <li>Protein: {selectedRecipe.nutrition?.protein || 0} g</li>
                    <li>Carbs: {selectedRecipe.nutrition?.carbs || 0} g</li>
                    <li>Fat: {selectedRecipe.nutrition?.fat || 0} g</li>
                    <li>Fiber: {selectedRecipe.nutrition?.fiber || 0} g</li>
                  </ul>
                </div>
                <p className="mt-4">
                  <strong>Status:</strong>{' '}
                  {selectedRecipe.isApproved === false ? (
                    <span className="text-yellow-600 dark:text-yellow-400">Pending Approval</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400">Approved</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Food Modal */}
        {showAddFoodModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddFoodModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Add New Food</h3>
                <button onClick={() => setShowAddFoodModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleAddFood} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={newFood.name.en}
                    onChange={(e) => setNewFood({ ...newFood, name: { en: e.target.value } })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Food Type *</label>
                  <select
                    required
                    value={newFood.type}
                    onChange={(e) => setNewFood({ ...newFood, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="">Select Type</option>
                    {foodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calories (kcal) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newFood.nutrition.calories}
                      onChange={(e) => setNewFood({ ...newFood, nutrition: { ...newFood.nutrition, calories: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Protein (g) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newFood.nutrition.protein}
                      onChange={(e) => setNewFood({ ...newFood, nutrition: { ...newFood.nutrition, protein: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carbohydrates (g) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newFood.nutrition.carbohydrates}
                      onChange={(e) => setNewFood({ ...newFood, nutrition: { ...newFood.nutrition, carbohydrates: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fat (g) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newFood.nutrition.fat}
                      onChange={(e) => setNewFood({ ...newFood, nutrition: { ...newFood.nutrition, fat: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fiber (g) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.1"
                      value={newFood.nutrition.fiber}
                      onChange={(e) => setNewFood({ ...newFood, nutrition: { ...newFood.nutrition, fiber: parseFloat(e.target.value) || 0 } })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Serving Size</label>
                    <input
                      type="text"
                      value={newFood.servingSize}
                      onChange={(e) => setNewFood({ ...newFood, servingSize: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                      placeholder="100g"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewFood({ ...newFood, image: e.target.files[0] })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddFoodModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Add Food
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Article Modal */}
        {showEditArticleModal && selectedArticle && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowEditArticleModal(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Article</h3>
                <button onClick={() => setShowEditArticleModal(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveArticleEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={editArticleData.topic}
                    onChange={(e) => setEditArticleData({ ...editArticleData, topic: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Body *</label>
                  <textarea
                    required
                    rows={10}
                    value={editArticleData.body}
                    onChange={(e) => setEditArticleData({ ...editArticleData, body: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary (Optional)</label>
                  <textarea
                    rows={3}
                    value={editArticleData.summary}
                    onChange={(e) => setEditArticleData({ ...editArticleData, summary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo (Optional)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setEditArticleData({ ...editArticleData, photo: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                    {editArticleData.photo && (
                      <p className="text-xs text-gray-500 mt-1">New file: {editArticleData.photo.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video (Optional)</label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setEditArticleData({ ...editArticleData, video: e.target.files[0] })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-gray-100"
                    />
                    {editArticleData.video && (
                      <p className="text-xs text-gray-500 mt-1">New file: {editArticleData.video.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditArticleModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
