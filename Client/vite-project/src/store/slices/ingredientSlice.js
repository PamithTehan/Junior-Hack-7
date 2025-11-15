import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchIngredients = createAsyncThunk(
  'ingredient/fetchIngredients',
  async ({ search, category, page = 1, limit = 50 }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (category) params.category = category;

      const response = await axios.get(`${API_URL}/ingredients`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch ingredients'
      );
    }
  }
);

export const fetchIngredient = createAsyncThunk(
  'ingredient/fetchIngredient',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/ingredients/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch ingredient'
      );
    }
  }
);

const initialState = {
  ingredients: [],
  selectedIngredient: null,
  total: 0,
  loading: false,
  error: null,
  searchTerm: '',
  category: '',
  currentPage: 1,
};

const ingredientSlice = createSlice({
  name: 'ingredient',
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
    clearSelectedIngredient: (state) => {
      state.selectedIngredient = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIngredients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.loading = false;
        state.ingredients = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchIngredients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIngredient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIngredient.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedIngredient = action.payload;
      })
      .addCase(fetchIngredient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setCategory, setCurrentPage, clearSelectedIngredient } =
  ingredientSlice.actions;
export default ingredientSlice.reducer;



