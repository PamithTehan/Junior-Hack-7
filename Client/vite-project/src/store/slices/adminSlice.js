import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set admin token in axios headers
const setAdminToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('adminToken', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('adminToken');
  }
};

// Load token from localStorage
const adminToken = localStorage.getItem('adminToken');
if (adminToken) {
  setAdminToken(adminToken);
}

// Async thunks
export const adminRegister = createAsyncThunk(
  'admin/register',
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/admin/register`, adminData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Admin registration failed'
      );
    }
  }
);

export const adminLogin = createAsyncThunk(
  'admin/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/admin/login`, credentials);
      setAdminToken(response.data.token);
      return response.data;
    } catch (error) {
      // Return the specific error message from server
      const errorMessage = error.response?.data?.message || 'Admin login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const getAdminMe = createAsyncThunk(
  'admin/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/admin/me`);
      return response.data;
    } catch (error) {
      setAdminToken(null);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch admin'
      );
    }
  }
);

export const adminLogout = createAsyncThunk('admin/logout', async () => {
  setAdminToken(null);
  return null;
});

const initialState = {
  admin: null,
  token: adminToken || null,
  isAuthenticated: !!adminToken,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(adminRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminRegister.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(adminRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(adminLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adminLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(adminLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Me
      .addCase(getAdminMe.fulfilled, (state, action) => {
        state.admin = action.payload.admin;
        state.isAuthenticated = true;
      })
      .addCase(getAdminMe.rejected, (state) => {
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
      })
      // Logout
      .addCase(adminLogout.fulfilled, (state) => {
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;

