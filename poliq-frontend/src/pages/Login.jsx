// Updated src/pages/Login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../store/authSlice';
import { toast } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.auth);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      // Use the enhanced login thunk action
      const result = await dispatch(loginUser({ email, password }));
      
      if (result.success) {
        toast.success('Login successful');
        
        // Check if user is admin and redirect to admin dashboard if they are
        const state = dispatch.getState(); // get the current state
        const user = state.auth.user;
        
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // Error is already handled by the thunk and set in the state
        toast.error(error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Login</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-900 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
          Register here
        </Link>
      </p>
      
      {/* Add admin login hint for the demo */}
      <div className="mt-8 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
        <p className="font-medium mb-1 text-gray-700 dark:text-gray-300">Demo Admin Login:</p>
        <p className="text-gray-600 dark:text-gray-400">Email: admin@poliq.com</p>
        <p className="text-gray-600 dark:text-gray-400">Password: admin123!</p>
      </div>
    </div>
  );
};

export default Login;
