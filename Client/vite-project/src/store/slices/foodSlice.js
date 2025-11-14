import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchFoods = createAsyncThunk(
  'food/fetchFoods',
  async ({ search, category, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await axios.get(`${API_URL}/foods`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch foods'
      );
    }
  }
);

export const fetchFood = createAsyncThunk(
  'food/fetchFood',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/foods/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch food'
      );
    }
  }
);

const initialState = {
  foods: [],
  selectedFood: null,
  total: 0,
  loading: false,
  error: null,
  searchTerm: '',
  category: '',
  currentPage: 1,
};

const foodSlice = createSlice({
  name: 'food',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearSelectedFood: (state) => {
      state.selectedFood = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFoods.fulfilled, (state, action) => {
        state.loading = false;
        state.foods = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchFoods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFood.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFood.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFood = action.payload;
      })
      .addCase(fetchFood.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setCategory, setCurrentPage, clearSelectedFood } =
  foodSlice.actions;
export default foodSlice.reducer;

