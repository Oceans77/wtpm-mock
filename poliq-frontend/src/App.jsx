import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { logoutUser } from './store/authSlice';
import DarkModeToggle from './components/DarkModeToggle';
import Button from './components/Button';
import ToastProvider from './components/ToastProvider';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import NewQuestion from './pages/NewQuestion';
import Profile from './pages/Profile';
import VerificationPage from './pages/Verification';
// Lazy load AdminDashboard to prevent issues if the component has errors
import { lazy, Suspense } from 'react';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Admin route component - ensures the user is both authenticated and has admin role
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logoutUser());
    setMobileMenuOpen(false);
  };
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <BrowserRouter>
      <ToastProvider />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Desktop Menu */}
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">PoliQ</Link>
                </div>
                <div className="hidden md:ml-6 md:flex md:space-x-4">
                  <Link to="/" className="nav-link px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Home
                  </Link>
                  <Link to="/questions" className="nav-link px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                    Questions
                  </Link>
                  {isAuthenticated && (
                    <Link to="/questions/new" className="nav-link px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      Ask a Question
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Desktop User Menu and Dark Mode Toggle */}
              <div className="hidden md:flex md:items-center md:space-x-4">
                {isAuthenticated ? (
                  <div className="relative group">
                    <div className="flex items-center text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">
                      {user?.displayName || user?.username} ▼
                    </div>
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 invisible group-hover:visible
                                transform opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                      {/* Add an invisible bridge element to maintain hover state */}
                      <div className="absolute h-2 w-full -top-2"></div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Profile
                      </Link>
                      <Link to="/verification" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                        Verification
                      </Link>
                      {/* Add admin dashboard link for admin users */}
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-indigo-700 dark:text-indigo-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700">
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="nav-link px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                      Login
                    </Link>
                    <Button 
                      to="/register" 
                      variant="primary"
                      size="md"
                    >
                      Sign Up
                    </Button>
                  </>
                )}
                <DarkModeToggle />
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <DarkModeToggle />
                <button
                  onClick={toggleMobileMenu}
                  className="ml-2 inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
                  aria-expanded="false"
                >
                  <span className="sr-only">Open main menu</span>
                  {/* Hamburger icon */}
                  <svg 
                    className={`${mobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  {/* X icon */}
                  <svg 
                    className={`${mobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/questions" 
                className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                Questions
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/questions/new" 
                  className="block px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ask a Question
                </Link>
              )}
            </div>
            
            {/* Mobile user menu */}
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              {isAuthenticated ? (
                <div>
                  <div className="px-4 py-2">
                    <div className="text-base font-medium text-gray-800 dark:text-white">{user?.displayName || user?.username}</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      to="/verification" 
                      className="block px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Verification
                    </Link>
                    {/* Add admin dashboard link for mobile admin users */}
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className="block px-4 py-2 text-indigo-700 dark:text-indigo-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 px-4">
                  <Link 
                    to="/login" 
                    className="block py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-2 px-4 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/questions" element={<Questions />} />
                {/* Fix route order: specific routes should come before dynamic routes */}
                <Route path="/questions/new" element={
                  <ProtectedRoute>
                    <NewQuestion />
                  </ProtectedRoute>
                } />
                <Route path="/questions/:questionId" element={<QuestionDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
                {/* Add the admin dashboard route with Suspense fallback */}
                <Route path="/admin" element={
                  <AdminRoute>
                    <Suspense fallback={<div className="text-center py-10">Loading Admin Dashboard...</div>}>
                      <AdminDashboard />
                    </Suspense>
                  </AdminRoute>
                } />
              </Routes>
            </PageTransition>
          </div>
        </main>        
        {/* Footer */}
        <footer className="bg-gray-800 dark:bg-gray-900 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            &copy; {new Date().getFullYear()} PoliQ
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
