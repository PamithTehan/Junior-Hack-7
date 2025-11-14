import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { getMe } from '../store/slices/authSlice';
import { updateProfile } from '../store/slices/userSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.user);
  const { register, handleSubmit, reset, watch } = useForm();
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        weight: user.healthProfile?.weight || '',
        height: user.healthProfile?.height || '',
        healthConditions: user.healthProfile?.healthConditions || [],
        goals: user.healthProfile?.goals || [],
        activityLevel: user.healthProfile?.activityLevel || 'sedentary',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const healthProfile = {
      weight: parseFloat(data.weight) || undefined,
      height: parseFloat(data.height) || undefined,
      healthConditions: Array.isArray(data.healthConditions)
        ? data.healthConditions
        : data.healthConditions
        ? [data.healthConditions]
        : [],
      goals: Array.isArray(data.goals) ? data.goals : data.goals ? [data.goals] : [],
      activityLevel: data.activityLevel || 'sedentary',
    };

    const profileData = {
      name: data.name,
      healthProfile,
    };

    try {
      await dispatch(updateProfile(profileData)).unwrap();
      await dispatch(getMe()); // Refresh user data
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const healthConditionsOptions = [
    'diabetes',
    'obesity',
    'heart_disease',
    'hypertension',
    'none',
  ];

  const goalsOptions = [
    'lose_weight',
    'gain_weight',
    'maintain_weight',
    'manage_diabetes',
    'heart_health',
    'general_health',
  ];

  const activityLevels = [
    { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
    { value: 'light', label: 'Light (exercise 1-3 days/week)' },
    { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
    { value: 'active', label: 'Active (exercise 6-7 days/week)' },
    { value: 'very_active', label: 'Very Active (intense exercise daily)' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Profile Settings</h1>
        <p className="text-gray-600">
          Update your health profile to get personalized meal plans and recommendations
        </p>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          Profile updated successfully!
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Form */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Personal Information</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Health Profile */}
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Health Profile</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    {...register('weight')}
                    type="number"
                    id="weight"
                    min="1"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    {...register('height')}
                    type="number"
                    id="height"
                    min="1"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Level
                </label>
                <select
                  {...register('activityLevel')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {activityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Conditions (Select all that apply)
                </label>
                <div className="space-y-2">
                  {healthConditionsOptions.map((condition) => (
                    <label key={condition} className="flex items-center">
                      <input
                        {...register('healthConditions')}
                        type="checkbox"
                        value={condition}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {condition.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Goals (Select all that apply)
                </label>
                <div className="space-y-2">
                  {goalsOptions.map((goal) => (
                    <label key={goal} className="flex items-center">
                      <input
                        {...register('goals')}
                        type="checkbox"
                        value={goal}
                        className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 capitalize">
                        {goal.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Summary</h2>
          {user?.healthProfile ? (
            <div className="space-y-4">
              <div>
                <span className="text-gray-600">BMI:</span>
                <span className="font-semibold ml-2 text-lg">
                  {user.healthProfile.bmi ? user.healthProfile.bmi.toFixed(1) : 'Calculate by entering weight & height'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Weight:</span>
                <span className="font-semibold ml-2">
                  {user.healthProfile.weight || 'N/A'} kg
                </span>
              </div>
              <div>
                <span className="text-gray-600">Height:</span>
                <span className="font-semibold ml-2">
                  {user.healthProfile.height || 'N/A'} cm
                </span>
              </div>
              <div>
                <span className="text-gray-600">Age:</span>
                <span className="font-semibold ml-2">
                  {user.dateOfBirth ? (() => {
                    const today = new Date();
                    const birthDate = new Date(user.dateOfBirth);
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }
                    return `${age} years`;
                  })() : user.healthProfile.age ? `${user.healthProfile.age} years` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Activity Level:</span>
                <span className="font-semibold ml-2 capitalize">
                  {user.healthProfile.activityLevel || 'N/A'}
                </span>
              </div>
              {user.healthProfile.dailyCalorieGoal && (
                <div className="bg-primary-50 p-4 rounded-lg mt-4">
                  <span className="text-gray-600">Daily Calorie Goal:</span>
                  <span className="font-bold ml-2 text-primary-600 text-lg">
                    {user.healthProfile.dailyCalorieGoal} kcal
                  </span>
                </div>
              )}
              {user.healthProfile.healthConditions?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-600 mb-2">Health Conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.healthProfile.healthConditions.map((condition, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {condition.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {user.healthProfile.goals?.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-600 mb-2">Goals:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.healthProfile.goals.map((goal, index) => (
                      <span
                        key={index}
                        className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm capitalize"
                      >
                        {goal.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">
              Complete your profile to see your summary here.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

