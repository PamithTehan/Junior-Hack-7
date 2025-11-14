/**
 * Form selection options constants
 * Used for registration, profile, and filtering purposes
 */

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Yes/No options (used for medical conditions, dietary preferences, etc.)
export const YES_NO_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

// Dietary preference options
export const DIETARY_PREFERENCE_OPTIONS = [
  { value: 'vegan', label: 'Vegan' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'non-vegetarian', label: 'Non-Vegetarian' },
];

// Medical condition options
export const MEDICAL_CONDITION_OPTIONS = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'cholesterol', label: 'Cholesterol Issues' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'other', label: 'Other' },
];

// Activity level options
export const ACTIVITY_LEVEL_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)' },
  { value: 'light', label: 'Light (exercise 1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (exercise 3-5 days/week)' },
  { value: 'active', label: 'Active (exercise 6-7 days/week)' },
  { value: 'very_active', label: 'Very Active (intense exercise daily)' },
];

// Health goal options
export const HEALTH_GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Lose Weight' },
  { value: 'gain_weight', label: 'Gain Weight' },
  { value: 'maintain_weight', label: 'Maintain Weight' },
  { value: 'manage_diabetes', label: 'Manage Diabetes' },
  { value: 'heart_health', label: 'Heart Health' },
  { value: 'general_health', label: 'General Health' },
];

// Helper functions for filtering
export const getGenderOptions = () => GENDER_OPTIONS;
export const getDietaryPreferenceOptions = () => DIETARY_PREFERENCE_OPTIONS;
export const getMedicalConditionOptions = () => MEDICAL_CONDITION_OPTIONS;
export const getActivityLevelOptions = () => ACTIVITY_LEVEL_OPTIONS;
export const getHealthGoalOptions = () => HEALTH_GOAL_OPTIONS;
export const getYesNoOptions = () => YES_NO_OPTIONS;

// Get option label by value
export const getGenderLabel = (value) => {
  const option = GENDER_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getDietaryPreferenceLabel = (value) => {
  const option = DIETARY_PREFERENCE_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getMedicalConditionLabel = (value) => {
  const option = MEDICAL_CONDITION_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value || 'None';
};

export const getActivityLevelLabel = (value) => {
  const option = ACTIVITY_LEVEL_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

export const getHealthGoalLabel = (value) => {
  const option = HEALTH_GOAL_OPTIONS.find(opt => opt.value === value);
  return option ? option.label : value;
};

// Filter helper functions
export const filterByGender = (items, gender) => {
  if (!gender) return items;
  return items.filter(item => item.gender === gender);
};

export const filterByDietaryPreference = (items, dietaryPreference) => {
  if (!dietaryPreference) return items;
  if (Array.isArray(dietaryPreference)) {
    return items.filter(item => 
      item.dietaryPreferences?.some(pref => dietaryPreference.includes(pref))
    );
  }
  return items.filter(item => 
    item.dietaryPreferences?.includes(dietaryPreference)
  );
};

export const filterByMedicalCondition = (items, condition) => {
  if (!condition) return items;
  return items.filter(item => {
    if (condition === 'diabetes') return item.diabetes === true;
    if (condition === 'cholesterol') return item.cholesterol === true;
    if (condition === 'other') return item.otherMedicalStatus && item.otherMedicalStatus.trim() !== '';
    return item.healthProfile?.healthConditions?.includes(condition);
  });
};

export const filterByActivityLevel = (items, activityLevel) => {
  if (!activityLevel) return items;
  return items.filter(item => 
    item.healthProfile?.activityLevel === activityLevel
  );
};

export const filterByHealthGoal = (items, goal) => {
  if (!goal) return items;
  return items.filter(item => 
    item.healthProfile?.goals?.includes(goal)
  );
};

