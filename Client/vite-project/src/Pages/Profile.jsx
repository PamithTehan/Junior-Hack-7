import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { getMe } from '../store/slices/authSlice';
import { updateProfile, updateEmail, updatePassword, updateName, clearError } from '../store/slices/userSlice';
import { fetchDailyIntakes } from '../store/slices/mealSlice';
import { FiDownload, FiFileText, FiUser, FiMail, FiLock, FiEdit2, FiCalendar, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error } = useSelector((state) => state.user);
  const { dailyIntakes } = useSelector((state) => state.meal);
  const [activeTab, setActiveTab] = useState('info');
  const [activeSubTab, setActiveSubTab] = useState('name');
  const [success, setSuccess] = useState('');
  const [mealHistory, setMealHistory] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Form hooks
  const profileForm = useForm();
  const emailForm = useForm();
  const passwordForm = useForm();
  const nameForm = useForm();

  useEffect(() => {
    dispatch(getMe());
    loadMealHistory();
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const userName = user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName || user.lastName || '');
      profileForm.reset({
        name: userName,
        weight: user.healthProfile?.weight || '',
        height: user.healthProfile?.height || '',
        healthConditions: user.healthProfile?.healthConditions || [],
        goals: user.healthProfile?.goals || [],
        activityLevel: user.healthProfile?.activityLevel || 'sedentary',
      });
      nameForm.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      emailForm.reset({
        email: user.email || '',
      });
    }
  }, [user, profileForm, nameForm, emailForm]);

  const loadMealHistory = async () => {
    try {
      const result = await dispatch(fetchDailyIntakes({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })).unwrap();
      setMealHistory(result || []);
    } catch (error) {
      console.error('Error loading meal history:', error);
      setMealHistory([]);
    }
  };

  useEffect(() => {
    if (activeTab === 'meals') {
      loadMealHistory();
    }
  }, [dateRange, activeTab]);

  // Sync with Redux state if available
  useEffect(() => {
    if (dailyIntakes && dailyIntakes.length > 0 && activeTab === 'meals') {
      setMealHistory(dailyIntakes);
    }
  }, [dailyIntakes, activeTab]);

  const handleProfileSubmit = async (data) => {
    try {
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

      await dispatch(updateProfile({ name: data.name, healthProfile })).unwrap();
      await dispatch(getMe());
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleEmailSubmit = async (data) => {
    try {
      await dispatch(updateEmail({ email: data.email, password: data.password })).unwrap();
      await dispatch(getMe());
      setSuccess('Email updated successfully!');
      emailForm.reset({ password: '' });
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handlePasswordSubmit = async (data) => {
    try {
      await dispatch(updatePassword({ 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      })).unwrap();
      setSuccess('Password updated successfully!');
      passwordForm.reset();
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleNameSubmit = async (data) => {
    try {
      await dispatch(updateName({ 
        firstName: data.firstName, 
        lastName: data.lastName 
      })).unwrap();
      await dispatch(getMe());
      setSuccess('Name updated successfully!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (error) {
      console.error('Error updating name:', error);
    }
  };

  // PDF Generation Functions
  const downloadUserInfoPDF = () => {
    const doc = new jsPDF();
    const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User');
    
    doc.setFontSize(20);
    doc.text('User Information', 20, 20);
    
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`Name: ${userName}`, 20, yPos);
    yPos += 10;
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Date of Birth: ${user?.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}`, 20, yPos);
    yPos += 10;
    doc.text(`Gender: ${user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'N/A'}`, 20, yPos);
    yPos += 15;
    
    if (user?.healthProfile) {
      doc.setFontSize(16);
      doc.text('Health Profile', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      doc.text(`Weight: ${user.healthProfile.weight || 'N/A'} kg`, 20, yPos);
      yPos += 10;
      doc.text(`Height: ${user.healthProfile.height || 'N/A'} cm`, 20, yPos);
      yPos += 10;
      doc.text(`BMI: ${user.healthProfile.bmi ? user.healthProfile.bmi.toFixed(1) : 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.text(`Activity Level: ${user.healthProfile.activityLevel || 'N/A'}`, 20, yPos);
      yPos += 10;
      doc.text(`Daily Calorie Goal: ${user.healthProfile.dailyCalorieGoal || 'N/A'} kcal`, 20, yPos);
      yPos += 15;
      
      if (user.healthProfile.healthConditions?.length > 0) {
        doc.text('Health Conditions:', 20, yPos);
        yPos += 10;
        user.healthProfile.healthConditions.forEach(condition => {
          doc.text(`  • ${condition.replace('_', ' ')}`, 25, yPos);
          yPos += 8;
        });
        yPos += 5;
      }
      
      if (user.healthProfile.goals?.length > 0) {
        doc.text('Health Goals:', 20, yPos);
        yPos += 10;
        user.healthProfile.goals.forEach(goal => {
          doc.text(`  • ${goal.replace('_', ' ')}`, 25, yPos);
          yPos += 8;
        });
      }
    }
    
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, doc.internal.pageSize.height - 20);
    doc.save(`user-information-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const downloadMedicalRecordsPDF = () => {
    const doc = new jsPDF();
    const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User');
    
    doc.setFontSize(20);
    doc.text('Medical Records', 20, 20);
    
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`Patient: ${userName}`, 20, yPos);
    yPos += 10;
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, yPos);
    yPos += 15;
    
    if (user?.medicalReports && user.medicalReports.length > 0) {
      doc.setFontSize(16);
      doc.text('Uploaded Reports', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      
      user.medicalReports.forEach((report, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${report.fileName || 'Report'}`, 20, yPos);
        yPos += 8;
        doc.text(`   Type: ${report.fileType || 'N/A'}`, 25, yPos);
        yPos += 8;
        doc.text(`   Uploaded: ${format(new Date(report.uploadedAt), 'MMM dd, yyyy')}`, 25, yPos);
        yPos += 10;
      });
    } else {
      doc.text('No medical reports uploaded.', 20, yPos);
    }
    
    yPos += 10;
    if (user?.diabetes || user?.cholesterol || user?.otherMedicalStatus) {
      doc.setFontSize(16);
      doc.text('Medical Conditions', 20, yPos);
      yPos += 10;
      doc.setFontSize(12);
      if (user.diabetes) {
        doc.text('• Diabetes', 25, yPos);
        yPos += 8;
      }
      if (user.cholesterol) {
        doc.text('• High Cholesterol', 25, yPos);
        yPos += 8;
      }
      if (user.otherMedicalStatus) {
        doc.text(`• ${user.otherMedicalStatus}`, 25, yPos);
        yPos += 8;
      }
    }
    
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, doc.internal.pageSize.height - 20);
    doc.save(`medical-records-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const downloadMealHistoryPDF = () => {
    const doc = new jsPDF();
    const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User');
    
    doc.setFontSize(20);
    doc.text('Meal History', 20, 20);
    
    let yPos = 40;
    doc.setFontSize(12);
    doc.text(`User: ${userName}`, 20, yPos);
    yPos += 10;
    doc.text(`Period: ${format(new Date(dateRange.startDate), 'MMM dd, yyyy')} - ${format(new Date(dateRange.endDate), 'MMM dd, yyyy')}`, 20, yPos);
    yPos += 15;
    
    if (mealHistory && mealHistory.length > 0) {
      mealHistory.forEach((intake, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        const intakeDate = format(new Date(intake.date), 'MMM dd, yyyy');
        doc.setFontSize(14);
        doc.text(intakeDate, 20, yPos);
        yPos += 10;
        
        doc.setFontSize(12);
        if (intake.foods && intake.foods.length > 0) {
          intake.foods.forEach(food => {
            doc.text(`  ${food.mealType}: ${food.foodName} (${food.quantity}x)`, 25, yPos);
            yPos += 8;
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }
          });
        } else {
          doc.text('  No meals recorded', 25, yPos);
          yPos += 8;
        }
        
        if (intake.totalNutrition) {
          yPos += 5;
          doc.text(`  Total: ${intake.totalNutrition.calories?.toFixed(0) || 0} kcal`, 25, yPos);
          yPos += 8;
        }
        yPos += 10;
      });
    } else {
      doc.text('No meal history found for this period.', 20, yPos);
    }
    
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 20, doc.internal.pageSize.height - 20);
    doc.save(`meal-history-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const tabs = [
    { id: 'info', label: 'User Information', icon: FiUser },
    { id: 'medical', label: 'Medical Records', icon: FiFileText },
    { id: 'meals', label: 'Meal History', icon: FiCalendar },
    { id: 'change', label: 'Change Info', icon: FiEdit2 },
  ];

  const userName = user?.name || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || user?.lastName || 'User');

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent mb-2">
              Profile
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your profile information and view your records</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/50">
            {(user?.name || user?.firstName || user?.lastName || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-5 py-4 rounded-xl mb-6 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-5 py-4 rounded-xl mb-6 shadow-lg animate-in slide-in-from-top-2 fade-in duration-300 flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-6 overflow-hidden">
        <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50/50 to-transparent dark:from-gray-800/50">
          <nav className="flex flex-wrap -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    dispatch(clearError());
                    setSuccess('');
                  }}
                  className={`relative flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-primary-50/50 dark:bg-primary-900/20'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 hover:bg-gray-50/50 dark:hover:bg-gray-700/30'
                  }`}
                >
                  <Icon className={`text-lg transition-transform duration-200 ${activeTab === tab.id ? 'scale-110' : ''}`} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-600"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* User Information Tab */}
          {activeTab === 'info' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Information</h2>
                <button
                  onClick={downloadUserInfoPDF}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-2.5 rounded-xl hover:from-primary-700 hover:to-primary-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
                >
                  <FiDownload className="text-lg" />
                  Download PDF
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                  <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <FiUser className="text-primary-600 dark:text-primary-400" />
                    Personal Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Name:</span>
                      <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{userName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{user?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                      <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                        {user?.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Gender:</span>
                      <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100 capitalize">
                        {user?.gender || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {user?.healthProfile && (
                  <div className="bg-gradient-to-br from-primary-50/50 to-primary-100/30 dark:from-primary-900/20 dark:to-primary-800/10 p-6 rounded-xl border border-primary-200/50 dark:border-primary-800/50 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                      <FiActivity className="text-primary-600 dark:text-primary-400" />
                      Health Profile
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                          {user.healthProfile.weight || 'N/A'} kg
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Height:</span>
                        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                          {user.healthProfile.height || 'N/A'} cm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">BMI:</span>
                        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                          {user.healthProfile.bmi ? user.healthProfile.bmi.toFixed(1) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Activity Level:</span>
                        <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100 capitalize">
                          {user.healthProfile.activityLevel || 'N/A'}
                        </span>
                      </div>
                      {user.healthProfile.dailyCalorieGoal && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Daily Calorie Goal:</span>
                          <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">
                            {user.healthProfile.dailyCalorieGoal} kcal
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user?.healthProfile?.healthConditions?.length > 0 && (
                  <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Health Conditions</h3>
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

                {user?.healthProfile?.goals?.length > 0 && (
                  <div className="md:col-span-2 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Health Goals</h3>
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
            </div>
          )}

          {/* Medical Records Tab */}
          {activeTab === 'medical' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Medical Records</h2>
                <button
                  onClick={downloadMedicalRecordsPDF}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiDownload />
                  Download PDF
                </button>
              </div>

              <div className="space-y-6">
                {(user?.diabetes || user?.cholesterol || user?.otherMedicalStatus) && (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Medical Conditions</h3>
                    <div className="space-y-2">
                      {user.diabetes && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-800 dark:text-gray-100">Diabetes</span>
                        </div>
                      )}
                      {user.cholesterol && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-800 dark:text-gray-100">High Cholesterol</span>
                        </div>
                      )}
                      {user.otherMedicalStatus && (
                        <div className="flex items-center gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-800 dark:text-gray-100">{user.otherMedicalStatus}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {user?.medicalReports && user.medicalReports.length > 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Uploaded Reports</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.medicalReports.map((report, index) => (
                        <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                                {report.fileName || `Report ${index + 1}`}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                Type: {report.fileType || 'N/A'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Uploaded: {format(new Date(report.uploadedAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            {report.url && (
                              <a
                                href={report.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary-600 hover:text-primary-700 ml-2"
                              >
                                View
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                    <p className="text-gray-600 dark:text-gray-400">No medical reports uploaded.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Meal History Tab */}
          {activeTab === 'meals' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Meal History</h2>
                <button
                  onClick={downloadMealHistoryPDF}
                  className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <FiDownload />
                  Download PDF
                </button>
              </div>

              <div className="mb-6 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {mealHistory && mealHistory.length > 0 ? (
                <div className="space-y-4">
                  {mealHistory.map((intake) => (
                    <div key={intake._id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                        {format(new Date(intake.date), 'EEEE, MMMM dd, yyyy')}
                      </h3>
                      {intake.foods && intake.foods.length > 0 ? (
                        <div className="space-y-3">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => {
                            const mealFoods = intake.foods.filter(f => f.mealType === mealType);
                            if (mealFoods.length === 0) return null;
                            return (
                              <div key={mealType} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 capitalize mb-2">
                                  {mealType}
                                </h4>
                                <ul className="space-y-1">
                                  {mealFoods.map((food, idx) => (
                                    <li key={idx} className="text-gray-600 dark:text-gray-400">
                                      {food.foodName} - {food.quantity}x
                                      {food.nutrition && (
                                        <span className="ml-2 text-sm">
                                          ({food.nutrition.calories?.toFixed(0) || 0} kcal)
                                        </span>
                                      )}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            );
                          })}
                          {intake.totalNutrition && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <p className="font-semibold text-gray-800 dark:text-gray-100">
                                Total: {intake.totalNutrition.calories?.toFixed(0) || 0} kcal
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-600 dark:text-gray-400">No meals recorded for this date.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center">
                  <p className="text-gray-600 dark:text-gray-400">No meal history found for the selected period.</p>
                </div>
              )}
            </div>
          )}

          {/* Change Info Tab */}
          {activeTab === 'change' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Change Information</h2>
              
              {/* Sub-tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex -mb-px">
                  <button
                    onClick={() => setActiveSubTab('name')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeSubTab === 'name'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Change Name
                  </button>
                  <button
                    onClick={() => setActiveSubTab('email')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeSubTab === 'email'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Change Email
                  </button>
                  <button
                    onClick={() => setActiveSubTab('password')}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeSubTab === 'password'
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              {/* Change Name Form */}
              {activeSubTab === 'name' && (
                <div className="max-w-md">
                  <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        {...nameForm.register('firstName', { required: 'First name is required' })}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        {...nameForm.register('lastName', { required: 'Last name is required' })}
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Name'}
                    </button>
                  </form>
                </div>
              )}

              {/* Change Email Form */}
              {activeSubTab === 'email' && (
                <div className="max-w-md">
                  <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Email
                      </label>
                      <input
                        {...emailForm.register('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: 'Invalid email format'
                          }
                        })}
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        {...emailForm.register('password', { required: 'Password is required' })}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </form>
                </div>
              )}

              {/* Change Password Form */}
              {activeSubTab === 'password' && (
                <div className="max-w-md">
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Current Password
                      </label>
                      <input
                        {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        New Password
                      </label>
                      <input
                        {...passwordForm.register('newPassword', { 
                          required: 'New password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        {...passwordForm.register('confirmPassword', { 
                          required: 'Please confirm your password',
                          validate: value => value === passwordForm.watch('newPassword') || 'Passwords do not match'
                        })}
                        type="password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
