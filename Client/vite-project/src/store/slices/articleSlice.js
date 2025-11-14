import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set auth token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Load token from localStorage
const token = localStorage.getItem('token');
if (token) {
  setAuthToken(token);
}

export const fetchArticles = createAsyncThunk(
  'article/fetchArticles',
  async ({ search, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (search) params.search = search;

      const response = await axios.get(`${API_URL}/articles`, { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch articles'
      );
    }
  }
);

export const fetchArticle = createAsyncThunk(
  'article/fetchArticle',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/articles/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch article'
      );
    }
  }
);

export const createArticle = createAsyncThunk(
  'article/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('topic', articleData.topic);
      formData.append('body', articleData.body);
      if (articleData.summary) formData.append('summary', articleData.summary);
      if (articleData.photo) formData.append('photo', articleData.photo);
      if (articleData.video) formData.append('video', articleData.video);

      const response = await axios.post(`${API_URL}/articles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create article'
      );
    }
  }
);

export const updateArticle = createAsyncThunk(
  'article/updateArticle',
  async ({ id, articleData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (articleData.topic) formData.append('topic', articleData.topic);
      if (articleData.body) formData.append('body', articleData.body);
      if (articleData.summary !== undefined) formData.append('summary', articleData.summary);
      if (articleData.photo) formData.append('photo', articleData.photo);
      if (articleData.video) formData.append('video', articleData.video);

      const response = await axios.put(`${API_URL}/articles/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update article'
      );
    }
  }
);

export const requestEditPermission = createAsyncThunk(
  'article/requestEditPermission',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/articles/${id}/request-edit`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to request edit permission'
      );
    }
  }
);

const initialState = {
  articles: [],
  selectedArticle: null,
  total: 0,
  loading: false,
  error: null,
  searchTerm: '',
  currentPage: 1,
};

const articleSlice = createSlice({
  name: 'article',
  initialState,
  reducers: {
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearSelectedArticle: (state) => {
      state.selectedArticle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        state.articles = action.payload.data;
        state.total = action.payload.total;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedArticle = action.payload;
      })
      .addCase(fetchArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally add to articles list
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.loading = false;
        // Update article in list if exists
        const index = state.articles.findIndex(a => a._id === action.payload.data._id);
        if (index !== -1) {
          state.articles[index] = action.payload.data;
        }
        if (state.selectedArticle && state.selectedArticle._id === action.payload.data._id) {
          state.selectedArticle = action.payload.data;
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(requestEditPermission.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestEditPermission.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestEditPermission.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchTerm, setCurrentPage, clearSelectedArticle, clearError } = articleSlice.actions;
export default articleSlice.reducer;

