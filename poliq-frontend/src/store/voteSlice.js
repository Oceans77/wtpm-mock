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
    },
    // Clear all votes (e.g., on logout)
    clearVotes: (state) => {
      state.userVotes = {};
    }
  }
});

export const { voteStart, voteSuccess, voteFail, removeVote, clearVotes } = votesSlice.actions;

// Async thunk to handle the voting process
export const castVote = (questionId, voteType) => async (dispatch, getState) => {
  try {
    dispatch(voteStart());
    
    // Get the questions state
    const { questions } = getState().questions;
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    // Simulate API call to cast vote
    // In production, this would be a real API call to your backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dispatch success action
    dispatch(voteSuccess({ questionId, voteType }));
    
    // Return updated vote count for UI updates
    return { 
      success: true, 
      message: 'Vote cast successfully',
      // This is just for the mock implementation - in production, 
      // the real vote count would come from the server
      newVoteCount: voteType === 'upvote' 
        ? question.votes + 1 
        : (voteType === 'downvote' ? question.votes - 1 : question.votes)
    };
  } catch (error) {
    dispatch(voteFail(error.message));
    return { 
      success: false, 
      message: error.message
    };
  }
};

// Async thunk to remove a vote
export const unvote = (questionId) => async (dispatch, getState) => {
  try {
    dispatch(voteStart());
    
    // Get current vote type
    const { userVotes } = getState().votes;
    const voteType = userVotes[questionId];
    
    if (!voteType) {
      throw new Error('No vote found for this question');
    }
    
    // Get the question
    const { questions } = getState().questions;
    const question = questions.find(q => q.id === questionId);
    
    if (!question) {
      throw new Error('Question not found');
    }
    
    // Simulate API call to remove vote
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dispatch remove vote action
    dispatch(removeVote(questionId));
    
    // Return updated vote count
    return { 
      success: true, 
      message: 'Vote removed successfully',
      // This is just for the mock implementation
      newVoteCount: voteType === 'upvote' 
        ? question.votes - 1 
        : (voteType === 'downvote' ? question.votes + 1 : question.votes)
    };
  } catch (error) {
    dispatch(voteFail(error.message));
    return { 
      success: false, 
      message: error.message
    };
  }
};

export default votesSlice.reducer;
