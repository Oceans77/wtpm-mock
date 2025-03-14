import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import Button from '../components/Button';
import AnimatedVoteCounter from '../components/AnimatedVoteCounter';
import Tooltip from '../components/Tooltip';
import VoteButton from '../components/VoteButton';

// Enhanced Question Card Component
const QuestionCard = ({ question, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/30 
      transition-all duration-300 ${isHovered ? 'transform -translate-y-1' : ''} animate-card-appear`}
      style={{ animationDelay: `${index * 0.1}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5 relative overflow-hidden">
        {/* Subtle gradient accent at the top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {question.categories.map(category => (
            <Tooltip key={category} text={`Browse ${category} questions`}>
              <span 
                className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 
                        text-xs px-2.5 py-1 rounded-full font-medium
                        border border-transparent hover:border-blue-200 dark:hover:border-blue-800
                        transition-colors duration-200"
              >
                {category}
              </span>
            </Tooltip>
          ))}
        </div>
        
        {/* Question Content */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug">
          {question.content}
        </h2>
        
        {/* Stats and Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
            <div className="flex items-center">
              <VoteButton questionId={question.id} currentVotes={question.votes} />
              <AnimatedVoteCounter votes={question.votes} />
            </div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{question.comments}</span>
            </div>
          </div>
          
          <Tooltip text="More options">
            <button 
              className={`rounded-full p-2.5 ${isHovered ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-transparent text-gray-400 dark:text-gray-500'} 
              hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400
              transition-colors duration-200`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

// Main Questions component with enhanced UI
const Questions = () => {
  const { questions, isLoading, error } = useSelector(state => state.questions);
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Skeleton loader for questions
  const QuestionSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-pulse p-5">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 mb-3"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4 mb-2"></div>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-full mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2"></div>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          <QuestionSkeleton />
          <QuestionSkeleton />
          <QuestionSkeleton />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-5 rounded-xl text-red-700 dark:text-red-300">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold mb-1">Error Loading Questions</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          <span className="text-blue-600 dark:text-blue-400">Trending</span> Questions
        </h1>
        {isAuthenticated && (
          <Button 
            to="/questions/new" 
            variant="primary"
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            }
          >
            Ask a Question
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} index={index} />
        ))}
      </div>
      
      {questions.length > 0 && (
        <div className="mt-8 text-center">
          <Button 
            variant="secondary"
          >
            Load More Questions
          </Button>
        </div>
      )}
      
      {questions.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No questions yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to ask a question!</p>
          {isAuthenticated ? (
            <Button to="/questions/new" variant="primary">
              Ask a Question
            </Button>
          ) : (
            <Button to="/login" variant="primary">
              Sign in to Ask
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default Questions;
