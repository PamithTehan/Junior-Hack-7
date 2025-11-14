import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MeetExpert = () => {
  const { user } = useSelector((state) => state.auth);
  const [dietitians, setDietitians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDietitian, setEditingDietitian] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactNumber: '',
    contactInfo: '',
    photo: null,
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'master';

  useEffect(() => {
    fetchDietitians();
  }, []);

  const fetchDietitians = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dietitians`);
      setDietitians(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch dietitians');
      console.error('Error fetching dietitians:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData({ ...formData, photo: files[0] || null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('contactNumber', formData.contactNumber);
      if (formData.contactInfo) {
        submitData.append('contactInfo', formData.contactInfo);
      }
      if (formData.photo) {
        submitData.append('photo', formData.photo);
      }

      if (editingDietitian) {
        // Update existing dietitian
        await axios.put(
          `${API_URL}/dietitians/${editingDietitian._id}`,
          submitData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setSuccess('Dietitian updated successfully!');
      } else {
        // Create new dietitian
        await axios.post(`${API_URL}/dietitians`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setSuccess('Dietitian added successfully!');
      }

      // Reset form and close modal
      resetForm();
      await fetchDietitians();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save dietitian'
      );
      console.error('Error saving dietitian:', err);
    }
  };

  const handleEdit = (dietitian) => {
    setEditingDietitian(dietitian);
    setFormData({
      name: dietitian.name || '',
      description: dietitian.description || '',
      contactNumber: dietitian.contactNumber || '',
      contactInfo: dietitian.contactInfo || '',
      photo: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dietitian? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      setError('');
      setSuccess('');
      
      await axios.delete(`${API_URL}/dietitians/${id}`);
      setSuccess('Dietitian deleted successfully!');
      await fetchDietitians();
      setDeletingId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setDeletingId(null);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to delete dietitian';
      setError(errorMessage);
      console.error('Error deleting dietitian:', err);
      setTimeout(() => setError(''), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contactNumber: '',
      contactInfo: '',
      photo: null,
    });
    setEditingDietitian(null);
    setShowModal(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Meet an EXPERT
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect with our expert dietitians for personalized nutrition guidance
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            + Add Dietitian
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      )}

      {/* Dietitian Tiles Grid */}
      {!loading && dietitians.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          <p className="text-xl">No dietitians available at the moment.</p>
          {isAdmin && (
            <p className="mt-2">Click "Add Dietitian" to add a new expert.</p>
          )}
        </div>
      )}

      {!loading && dietitians.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dietitians.map((dietitian) => (
            <div
              key={dietitian._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Photo */}
              <div className="h-48 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center overflow-hidden">
                {dietitian.photo ? (
                  <img
                    src={dietitian.photo}
                    alt={dietitian.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-6xl">👨‍⚕️</div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                  {dietitian.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {dietitian.description}
                </p>

                {/* Contact Information */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <svg
                      className="w-5 h-5 mr-2 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a
                      href={`tel:${dietitian.contactNumber}`}
                      className="hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {dietitian.contactNumber}
                    </a>
                  </div>
                  {dietitian.contactInfo && (
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {dietitian.contactInfo}
                    </div>
                  )}
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleEdit(dietitian)}
                      disabled={deletingId === dietitian._id}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dietitian._id)}
                      disabled={deletingId === dietitian._id}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {deletingId === dietitian._id ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editingDietitian ? 'Edit Dietitian' : 'Add New Dietitian'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Contact Info (Optional)
                  </label>
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Photo (Optional)
                  </label>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                  />
                  {editingDietitian?.photo && !formData.photo && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current Photo:
                      </p>
                      <img
                        src={editingDietitian.photo}
                        alt={editingDietitian.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingDietitian ? 'Update' : 'Add'} Dietitian
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetExpert;

