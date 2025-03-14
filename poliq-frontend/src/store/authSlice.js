// src/store/authSlice.js - add vote clearing on logout
import { createSlice } from '@reduxjs/toolkit';
import { clearVotes } from './votesSlice'; // Import the action

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
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

export const { setUser, setLoading, setError, logout } = authSlice.actions;

// Enhanced logout thunk that also clears votes
export const logoutUser = () => (dispatch) => {
  // Clear the user's votes when they log out
  dispatch(clearVotes());
  // Then log them out
  dispatch(logout());
};

export default authSlice.reducer;
