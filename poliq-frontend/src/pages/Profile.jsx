import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';

const Profile = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 transition-colors">
        <div className="flex items-center">
          <div className="h-20 w-20 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.displayName || user?.username}</h1>
            <p className="text-gray-600 dark:text-gray-400">@{user?.username}</p>
            <div className="mt-2">
              {user?.verificationStatus === 'verified' ? (
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
                  ✓ Verified
                </span>
              ) : (
                <Link 
                  to="/verification" 
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                >
                  Get Verified
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <div className="mt-1 text-gray-900 dark:text-gray-100">{user?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <div className="mt-1 text-gray-900 dark:text-gray-100">@{user?.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Display Name</label>
              <div className="mt-1 text-gray-900 dark:text-gray-100">{user?.displayName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status</label>
              <div className="mt-1 text-gray-900 dark:text-gray-100">{user?.verificationStatus || 'Unverified'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Your Questions</h2>
        <p className="text-gray-600 dark:text-gray-400">You haven't asked any questions yet.</p>
        <div className="mt-4">
          <Link 
            to="/questions/new"
            className="inline-block bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Ask Your First Question
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
