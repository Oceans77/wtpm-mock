import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { logout } from './store/authSlice';
import Login from './pages/Login';
import Register from './pages/Register';
import Questions from './pages/Questions';
import NewQuestion from './pages/NewQuestion';
import Profile from './pages/Profile';
import VerificationPage from './pages/Verification';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Home component
const Home = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-blue-600">Welcome to PoliQ</h1>
    <p className="mt-4 text-lg">
      PoliQ is a platform that bridges the gap between citizens and news media. 
      Ask political questions, vote on what matters, and get answers from news organizations.
    </p>
    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-blue-600 mb-2">Submit Questions</h3>
        <p>Ask the political questions you want answered by media organizations.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-blue-600 mb-2">Vote on Questions</h3>
        <p>Vote on questions you think are important and should be addressed.</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-blue-600 mb-2">Get Answers</h3>
        <p>Questions with the most votes get addressed by news organizations.</p>
      </div>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
  };
  
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation */}
        <nav className="bg-white shadow">
          <div className="container mx-auto px-6 py-3 flex justify-between">
            <div className="text-2xl font-bold text-blue-600">PoliQ</div>
            <ul className="flex space-x-4 items-center">
              <li>
                <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
              </li>
              <li>
                <Link to="/questions" className="text-gray-600 hover:text-blue-600">Questions</Link>
              </li>
              
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/questions/new" className="text-gray-600 hover:text-blue-600">
                      Ask a Question
                    </Link>
                  </li>
                  <li className="relative group">
                    <button className="flex items-center text-gray-600 hover:text-blue-600">
                      {user?.displayName || user?.username} ▼
                    </button>
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 hidden group-hover:block">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <Link to="/verification" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Verification
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
                  </li>
                  <li>
                    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700">
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </nav>
        
        {/* Content */}
        <main className="flex-grow container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/questions/new" element={
              <ProtectedRoute>
                <NewQuestion />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/verification" element={
              <ProtectedRoute>
                <VerificationPage />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white py-6">
          <div className="container mx-auto px-6 text-center">
            &copy; {new Date().getFullYear()} PoliQ
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
