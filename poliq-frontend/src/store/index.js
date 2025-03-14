import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import questionsReducer from './questionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    questions: questionsReducer
  }
});
