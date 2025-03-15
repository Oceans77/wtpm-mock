// src/store/minimalStore.js
import { configureStore, createSlice } from '@reduxjs/toolkit';

// Create a simple auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    }
  }
});

// Export actions
export const { setUser, setLoading, setError, logout } = authSlice.actions;

// Create store with just the auth reducer
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer
  }
});

export default store;
