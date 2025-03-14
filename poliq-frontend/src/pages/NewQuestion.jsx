import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Button from '../components/Button';
import Tooltip from '../components/Tooltip';

const CATEGORIES = [
  { id: 'healthcare', name: 'Healthcare', color: 'blue' },
  { id: 'economy', name: 'Economy', color: 'blue' },
  { id: 'foreign-policy', name: 'Foreign Policy', color: 'blue' },
  { id: 'federal', name: 'Federal', color: 'green' },
  { id: 'state', name: 'State', color: 'green' },
  { id: 'local', name: 'Local', color: 'green' },
  { id: 'infrastructure', name: 'Infrastructure', color: 'indigo' },
  { id: 'education', name: 'Education', color: 'indigo' },
  { id: 'environment', name: 'Environment', color: 'indigo' }
];

const NewQuestion = () => {
  const [content, setContent] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
  const toggleCategory = (categoryId) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      // Add with animation
      setSelectedCategories(prev => [...prev, categoryId]);
      
      // Hide the prompt once user starts selecting categories
      setShowPrompt(false);
    }
  };
  
  const getCategoryClass = (category) => {
    const isSelected = selectedCategories.includes(category.id);
    const baseClasses = "px-3 py-2 rounded-full text-sm font-medium transition-all duration-300";
    
    if (!isSelected) return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transform hover:scale-105`;
    
    switch (category.color) {
      case 'blue':
        return `${baseClasses} bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 transform scale-105`;
      case 'green':
        return `${baseClasses} bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 transform scale-105`;
      case 'indigo':
        return `${baseClasses} bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 transform scale-105`;
      default:
        return `${baseClasses} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transform scale-105`;
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (content.trim().length < 10) {
      toast.error('Your question is too short');
      return;
    }
    
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Submitting your question...');
    
    // Simulate API call
    setTimeout(() => {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      // Show success toast
      toast.success('Question submitted successfully!');
      navigate('/questions');
    }, 1500);
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-colors animate-card-appear">
      <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6">Ask a Question</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Your Question
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (e.target.value.length > 0 && showPrompt) {
                setShowPrompt(false);
              }
            }}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 
                     text-gray-900 dark:text-white rounded-lg animate-focus-ring
                     focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 
                     transition-colors"
            rows={4}
            placeholder="Type your political question here..."
            required
          ></textarea>
          <div className="mt-1 flex justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">Be clear and specific</span>
            <span className={`${content.length < 10 ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'} transition-colors`}>
              {content.length} / 280 characters
            </span>
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
            Categories (select at least one)
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <Tooltip key={category.id} text={`${selectedCategories.includes(category.id) ? 'Remove' : 'Add'} ${category.name} category`}>
                <button
                  type="button"
                  className={getCategoryClass(category)}
                  onClick={() => toggleCategory(category.id)}
                >
                  {category.name}
                </button>
              </Tooltip>
            ))}
          </div>
          {showPrompt && selectedCategories.length === 0 && (
            <p className="mt-2 text-sm text-blue-600 dark:text-blue-400 animate-pulse">
              Select at least one category that best matches your question
            </p>
          )}
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Question Submission Fee</h3>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                <p>There is a $0.99 fee to submit a question. This helps ensure quality content on the platform.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/questions')}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting || content.trim().length < 10 || selectedCategories.length === 0}
          >
            Submit Question
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewQuestion;
