// src/store/index.js - Fixed version
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import questionsReducer from './questionsSlice';
import votesReducer from './votesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionsReducer,
    votes: votesReducer
  }
});

export default store;
