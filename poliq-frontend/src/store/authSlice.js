// Updated src/store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { clearVotes } from './votesSlice';

// Initialize with localStorage values if available
const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedUser && !!storedToken,
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
      // Save to localStorage for persistence across page loads
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setToken: (state, action) => {
      state.token = action.payload;
      // Save token to localStorage
      localStorage.setItem('token', action.payload);
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
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      // Clear localStorage on logout
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
});

export const { setUser, setToken, setLoading, setError, logout } = authSlice.actions;

// Login thunk with proper role handling
export const loginUser = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // For demo: Simulate login API call
    // In production, replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo admin credentials 
    if (credentials.email === 'admin@poliq.com' && credentials.password === 'admin123!') {
      const token = 'demo-admin-token';
      const user = {
        id: '386629b5-7e7e-470d-9766-f0f040daf84f',
        email: 'admin@poliq.com',
        username: 'admin',
        displayName: 'Admin User',
        role: 'admin',
        verificationStatus: 'verified'
      };
      
      dispatch(setToken(token));
      dispatch(setUser(user));
      
      return { success: true };
    } 
    // Demo regular user
    else if (credentials.email && credentials.password) {
      const token = 'demo-user-token';
      const user = {
        id: '1',
        email: credentials.email,
        username: credentials.email.split('@')[0],
        displayName: credentials.email.split('@')[0],
        role: 'user',
        verificationStatus: 'unverified'
      };
      
      dispatch(setToken(token));
      dispatch(setUser(user));
      
      return { success: true };
    } else {
      throw new Error('Invalid credentials');
    }
  } catch (error) {
    dispatch(setError(error.message));
    return { success: false, error: error.message };
  }
};

// Enhanced logout thunk that also clears votes
export const logoutUser = () => (dispatch) => {
  // Clear the user's votes when they log out
  dispatch(clearVotes());
  // Then log them out
  dispatch(logout());
};

export default authSlice.reducer;
