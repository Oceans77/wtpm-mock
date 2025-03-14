// src/pages/Home.jsx
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated } = useSelector(state => state.auth);
  
  return (
    <div className="pb-10">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bridging Citizens and News Media
          </h1>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
            PoliQ is a platform where you can ask political questions, vote on what matters most, 
            and get real answers from news organizations.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {isAuthenticated ? (
              <Link 
                to="/questions/new" 
                className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                Ask Your Question
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                Join PoliQ Today
              </Link>
            )}
            <Link 
              to="/questions" 
              className="bg-transparent text-white border-2 border-white hover:bg-white hover:text-blue-700 py-3 px-8 rounded-full font-bold text-lg transition-colors"
            >
              Explore Questions
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          How PoliQ Works
        </h2>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 transition-transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">1. Ask Questions</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Submit your political questions that you want answered by media organizations and public figures.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 transition-transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">2. Vote & Discuss</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Vote on questions that matter to you and engage in thoughtful discussions with other community members.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex-1 transition-transform hover:scale-105">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-900 dark:text-white">3. Get Answers</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Top questions get addressed by news organizations, ensuring the most important issues get covered.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Questions Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Trending Questions
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg">
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Healthcare</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Federal</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Why hasn't Congress addressed the rising cost of healthcare for middle-class Americans?</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>4,382 votes</span>
                  <span>243 comments</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg">
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Economy</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Federal</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">What specific plans does the administration have to address inflation?</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>3,928 votes</span>
                  <span>187 comments</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-lg">
              <div className="p-6">
                <div className="flex gap-2 mb-3 flex-wrap">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Infrastructure</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">Rural</span>
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">How will the new infrastructure bill specifically help rural communities?</h3>
                <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                  <span>3,541 votes</span>
                  <span>156 comments</span>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link 
              to="/questions" 
              className="inline-block bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 py-2 px-6 rounded-lg font-medium transition-colors"
            >
              View All Questions
            </Link>
          </div>
        </div>
      </div>

      {/* Why PoliQ Section */}
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Why Choose PoliQ?
        </h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Verified Users</h3>
                  <p className="text-gray-600 dark:text-gray-300">Our verification system ensures that all interactions are from real people, maintaining high-quality discourse.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Democratic Process</h3>
                  <p className="text-gray-600 dark:text-gray-300">The community decides which questions deserve attention through a transparent voting system.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Media Accountability</h3>
                  <p className="text-gray-600 dark:text-gray-300">We partner with news organizations to ensure the most important questions get addressed.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Data Privacy</h3>
                  <p className="text-gray-600 dark:text-gray-300">Your personal information is protected with industry-standard security measures.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call To Action */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900">
        <div className="container mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to make your voice heard?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of citizens who are shaping the political conversation through PoliQ.
          </p>
          <div className="flex justify-center">
            {isAuthenticated ? (
              <Link 
                to="/questions/new" 
                className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                Ask Your Question
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="bg-white text-blue-700 hover:bg-blue-50 py-3 px-8 rounded-full font-bold text-lg transition-colors shadow-lg"
              >
                Join PoliQ Today
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
