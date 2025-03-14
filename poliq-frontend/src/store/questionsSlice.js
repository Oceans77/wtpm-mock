// src/store/questionsSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  questions: [
    {
      id: '1',
      content: "Why hasn't Congress addressed the rising cost of healthcare for middle-class Americans?",
      categories: ["Healthcare", "Federal"],
      votes: 4382,
      comments: 243
    },
    {
      id: '2',
      content: "What specific plans does the administration have to address inflation?",
      categories: ["Economy", "Federal"],
      votes: 3928,
      comments: 187
    },
    {
      id: '3',
      content: "How will the new infrastructure bill specifically help rural communities?",
      categories: ["Infrastructure", "Rural"],
      votes: 3541,
      comments: 156
    }
  ],
  isLoading: false,
  error: null
};

const questionsSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    setQuestions: (state, action) => {
      state.questions = action.payload;
      state.isLoading = false;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    // New reducer to update a question's vote count
    updateQuestionVotes: (state, action) => {
      const { questionId, newVoteCount } = action.payload;
      const question = state.questions.find(q => q.id === questionId);
      if (question) {
        question.votes = newVoteCount;
      }
    },
    // Add a new question
    addQuestion: (state, action) => {
      state.questions.unshift(action.payload);
    }
  }
});

export const { 
  setQuestions, 
  setLoading, 
  setError, 
  updateQuestionVotes,
  addQuestion
} = questionsSlice.actions;

export default questionsSlice.reducer;
