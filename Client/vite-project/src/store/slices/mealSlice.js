import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchMealPlans = createAsyncThunk(
  'meal/fetchMealPlans',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/mealplans`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch meal plans'
      );
    }
  }
);

export const generateMealPlan = createAsyncThunk(
  'meal/generateMealPlan',
  async (date, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/mealplans/generate`, { date });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to generate meal plan'
      );
    }
  }
);

export const createMealPlan = createAsyncThunk(
  'meal/createMealPlan',
  async (mealPlanData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/mealplans`, mealPlanData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create meal plan'
      );
    }
  }
);

export const fetchDailyIntakes = createAsyncThunk(
  'meal/fetchDailyIntakes',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/tracking`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily intakes'
      );
    }
  }
);

export const fetchDailyIntake = createAsyncThunk(
  'meal/fetchDailyIntake',
  async (date, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/tracking/${date}`);
      return response.data.data;
    } catch (error) {
      // If 404, return null instead of rejecting (no intake exists yet)
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch daily intake'
      );
    }
  }
);

export const addFoodToIntake = createAsyncThunk(
  'meal/addFoodToIntake',
  async (foodData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/tracking`, foodData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add food'
      );
    }
  }
);

export const removeFoodFromIntake = createAsyncThunk(
  'meal/removeFoodFromIntake',
  async ({ intakeId, foodItemId }, { rejectWithValue }) => {
    try {
      // Build URL with query parameters manually for DELETE requests
      const url = `${API_URL}/tracking/food?intakeId=${encodeURIComponent(intakeId)}&foodItemId=${encodeURIComponent(foodItemId)}`;
      console.log('DELETE request URL:', url);
      const response = await axios.delete(url);
      return response.data.data;
    } catch (error) {
      console.error('DELETE error:', error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to remove food'
      );
    }
  }
);

const initialState = {
  mealPlans: [],
  currentMealPlan: null,
  dailyIntakes: [],
  currentDailyIntake: null,
  loading: false,
  error: null,
};

const mealSlice = createSlice({
  name: 'meal',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentMealPlan: (state) => {
      state.currentMealPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Meal Plans
      .addCase(fetchMealPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMealPlans.fulfilled, (state, action) => {
        state.loading = false;
        state.mealPlans = action.payload;
      })
      .addCase(fetchMealPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Generate Meal Plan
      .addCase(generateMealPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateMealPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMealPlan = action.payload;
      })
      .addCase(generateMealPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Meal Plan
      .addCase(createMealPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMealPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMealPlan = action.payload;
      })
      .addCase(createMealPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Daily Intakes
      .addCase(fetchDailyIntakes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyIntakes.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyIntakes = action.payload;
      })
      .addCase(fetchDailyIntakes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Daily Intake
      .addCase(fetchDailyIntake.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyIntake.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDailyIntake = action.payload || null;
        state.error = null;
      })
      .addCase(fetchDailyIntake.rejected, (state, action) => {
        state.loading = false;
        // Don't show error if it's a 404 (no intake exists yet)
        if (action.payload?.includes('404') || action.payload?.includes('not found')) {
          state.currentDailyIntake = null;
          state.error = null;
        } else {
          state.error = action.payload;
        }
      })
      // Add Food to Intake
      .addCase(addFoodToIntake.fulfilled, (state, action) => {
        state.currentDailyIntake = action.payload;
      })
      // Remove Food from Intake
      .addCase(removeFoodFromIntake.fulfilled, (state, action) => {
        state.currentDailyIntake = action.payload;
      });
  },
});

export const { clearError, clearCurrentMealPlan } = mealSlice.actions;
export default mealSlice.reducer;

