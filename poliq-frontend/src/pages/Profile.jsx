import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';

const Profile = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center">
          <div className="h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.displayName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold">{user?.displayName || user?.username}</h1>
            <p className="text-gray-600">@{user?.username}</p>
            <div className="mt-2">
              {user?.verificationStatus === 'verified' ? (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  ✓ Verified
                </span>
              ) : (
                <Link 
                  to="/verification" 
                  className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full hover:bg-blue-200"
                >
                  Get Verified
                </Link>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 text-gray-900">{user?.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <div className="mt-1 text-gray-900">@{user?.username}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <div className="mt-1 text-gray-900">{user?.displayName}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Status</label>
              <div className="mt-1 text-gray-900">{user?.verificationStatus || 'Unverified'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Your Questions</h2>
        <p className="text-gray-600">You haven't asked any questions yet.</p>
        <div className="mt-4">
          <Link 
            to="/questions/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Ask Your First Question
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;
