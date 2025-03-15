// src/store/votesSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Track user votes by question ID
  userVotes: {},
  // Track loading state for vote operations
  isVoting: false,
  error: null
};

const votesSlice = createSlice({
  name: 'votes',
  initialState,
  reducers: {
    // Start vote operation
    voteStart: (state) => {
      state.isVoting = true;
      state.error = null;
    },
    // Successfully cast a vote
    voteSuccess: (state, action) => {
      const { questionId, voteType } = action.payload;
      // Record the user's vote for this question
      state.userVotes[questionId] = voteType;
      state.isVoting = false;
    },
    // Vote operation failed
    voteFail: (state, action) => {
      state.isVoting = false;
      state.error = action.payload;
    },
    // Remove a vote (unvote)
    removeVote: (state, action) => {
      const questionId = action.payload;
      // Remove this question from user votes
      delete state.userVotes[questionId];
      state.isVoting = false;
    },
    // Clear all votes (e.g., on logout)
    clearVotes: (state) => {
      state.userVotes = {};
    }
  }
});

export const { 
  voteStart, 
  voteSuccess, 
  voteFail, 
  removeVote, 
  clearVotes 
} = votesSlice.actions;

// Simplified thunk to cast a vote
export const castVote = (params) => async (dispatch) => {
  const { questionId, voteType } = params;
  try {
    dispatch(voteStart());
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Successful vote
    dispatch(voteSuccess({ questionId, voteType }));
    return { success: true };
  } catch (error) {
    dispatch(voteFail(error.toString()));
    throw error; // Re-throw to be caught by the component
  }
};

// Simplified thunk to unvote
export const unvote = (questionId) => async (dispatch) => {
  try {
    dispatch(voteStart());
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Successfully removed vote
    dispatch(removeVote(questionId));
    return { success: true };
  } catch (error) {
    dispatch(voteFail(error.toString()));
    throw error; // Re-throw to be caught by the component
  }
};

export default votesSlice.reducer;
