import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchRecipes = createAsyncThunk(
  'recipe/fetchRecipes',
  async ({ search, dietaryType, tag, nutritionFilter, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;
      if (dietaryType) params.dietaryType = dietaryType;
      if (tag) params.tag = tag;
      if (nutritionFilter) params.nutritionFilter = nutritionFilter;

      const response = await axios.get(`${API_URL}/recipes`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recipes'
      );
    }
  }
);

export const fetchRecipe = createAsyncThunk(
  'recipe/fetchRecipe',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch recipe'
      );
    }
  }
);

const initialState = {
  recipes: [],
  selectedRecipe: null,
  total: 0,
  loading: false,
  error: null,
  searchTerm: '',
  currentPage: 1,
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearSelectedRecipe: (state) => {
      state.selectedRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRecipe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipe.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRecipe = action.payload;
      })
      .addCase(fetchRecipe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setCurrentPage, clearSelectedRecipe } =
  recipeSlice.actions;
export default recipeSlice.reducer;

