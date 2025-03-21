import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setUser, setLoading, setError } from '../store/authSlice';
import { toast } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector(state => state.auth);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    dispatch(setLoading(true));
    
    // Simulate API call for now
    setTimeout(() => {
      // For demo, just simulate a successful registration
      dispatch(setUser({
        id: '1',
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName,
        verificationStatus: 'unverified'
      }));
      toast.success('Registration successful');
      navigate('/');
    }, 1000);
  };
  
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md transition-colors">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Register</h2>
      
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
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="displayName">Display Name</label>
          <input
            id="displayName"
            type="text"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="Your Name"
            value={formData.displayName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="******"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            placeholder="******"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-900 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-gray-700 dark:text-gray-300">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Login here
        </Link>
      </p>
    </div>
  );
};

export default Register;
