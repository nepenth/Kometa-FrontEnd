import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios'; // Keep for isAxiosError check if needed, or better, remove and use generic error handling
import { jwtDecode } from 'jwt-decode';

import { apiService } from '../../services/api';

// Define types
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  user: {
    username: string;
    email: string;
  } | null;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
}

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: Boolean(localStorage.getItem('token')),
  loading: false,
  error: null,
  user: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiService.post<LoginResponse>(
        '/auth/token',
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
          grant_type: 'password',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token } = response;
      localStorage.setItem('token', access_token);

      // Decode token to get user info
      const decoded: DecodedToken = jwtDecode(access_token);
      const user = {
        username: decoded.sub,
        email: `${decoded.sub}@kometa.local`,
      };

      return { token: access_token, user };
    } catch (err) {
      const error = err as any;
      return rejectWithValue(error.response?.data?.detail || 'Login failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return rejectWithValue('No token found');
    }

    // Verify token is still valid
    const decoded: DecodedToken = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return rejectWithValue('Token expired');
    }

    const user = {
      username: decoded.sub,
      email: `${decoded.sub}@kometa.local`,
    };

    return { token, user };
  } catch (error) {
    localStorage.removeItem('token');
    return rejectWithValue('Invalid token');
  }
});

// Create slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
        state.error = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.token = null;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
