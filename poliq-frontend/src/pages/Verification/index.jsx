import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VerificationTypes = [
  {
    id: 'government_id',
    title: 'Government ID',
    description: 'Verify your identity with a driver\'s license, passport, or ID card',
    icon: '🪪'
  },
  {
    id: 'credit_card',
    title: 'Credit Card Verification',
    description: 'Verify with a small authorization hold ($0)',
    icon: '💳'
  },
  {
    id: 'social_media',
    title: 'Social Media',
    description: 'Connect a verified social media account',
    icon: '🌐'
  }
];

const VerificationPage = () => {
  const [selectedType, setSelectedType] = useState('government_id');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If already verified, redirect to profile
  if (user?.verificationStatus === 'verified') {
    return <Navigate to="/profile" />;
  }
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Verification process started!');
      toast.info('This is a simulated verification. In a real app, you would upload documents or connect accounts.');
    }, 1500);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4">Verify Your Identity</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Verification is required to ensure platform integrity and helps us maintain a trustworthy community.
        </p>
        
        <div className="mb-6">
          <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
            <div className="h-2 w-1/4 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Step 1 of 4: Choose verification method</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 mb-6">
            {VerificationTypes.map(type => (
              <div
                key={type.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedType === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedType(type.id)}
              >
                <div className="flex items-start">
                  <div className="text-2xl mr-3">{type.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{type.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{type.description}</p>
                  </div>
                  <div className="ml-auto">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedType === type.id
                        ? 'border-blue-500 bg-blue-500 dark:border-blue-400 dark:bg-blue-400'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedType === type.id && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Your Privacy Is Important</h3>
                <div className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  <p>All verification documents are encrypted and only used for identity verification purposes.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between">
            <Link
              to="/profile"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-900 transition-colors"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationPage;
