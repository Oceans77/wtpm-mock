#!/bin/bash
# Script to set up admin functionality in PoliQ backend

echo "Setting up admin functionality..."

# Make sure we're in the project root directory
cd "$(dirname "$0")"

# Create admin directory
mkdir -p poliq-backend/src/api/admin
echo "Created admin directory"

# Create admin controller file
cat > poliq-backend/src/api/admin/admin.controller.js << 'EOF'
// src/api/admin/admin.controller.js
const { getActiveSessions, readLogs } = require('../../utils/connectionLogger');

// Get active sessions
exports.getActiveSessions = (req, res) => {
  try {
    const sessions = getActiveSessions();
    
    // Return summary stats with the sessions
    const stats = {
      totalSessions: sessions.length,
      deviceBreakdown: sessions.reduce((acc, session) => {
        acc[session.device] = (acc[session.device] || 0) + 1;
        return acc;
      }, {}),
      browserBreakdown: sessions.reduce((acc, session) => {
        acc[session.browser] = (acc[session.browser] || 0) + 1;
        return acc;
      }, {}),
      countryBreakdown: sessions.reduce((acc, session) => {
        acc[session.location.country] = (acc[session.location.country] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json({
      stats,
      sessions
    });
  } catch (error) {
    console.error('Error fetching active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
};

// Get recent logs
exports.getRecentLogs = (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = readLogs(limit);
    
    // Group logs by type for easier analysis
    const groupedLogs = {
      newSessions: logs.filter(log => log.type === 'new_session'),
      requests: logs.filter(log => log.type === 'request'),
      responses: logs.filter(log => log.type === 'response')
    };
    
    res.json({
      total: logs.length,
      groupedLogs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

// Get log summary
exports.getLogSummary = (req, res) => {
  try {
    const logs = readLogs(1000); // Get a significant sample
    
    // Calculate common metrics
    const summary = {
      totalRequests: logs.filter(log => log.type === 'request').length,
      uniqueIPs: new Set(logs.map(log => log.ip)).size,
      averageResponseTime: logs.filter(log => log.type === 'response')
        .reduce((sum, log) => sum + parseFloat(log.responseTime || 0), 0) / 
        logs.filter(log => log.type === 'response').length || 0,
      popularEndpoints: logs.filter(log => log.type === 'request')
        .reduce((acc, log) => {
          acc[log.url] = (acc[log.url] || 0) + 1;
          return acc;
        }, {}),
      statusCodes: logs.filter(log => log.type === 'response')
        .reduce((acc, log) => {
          acc[log.statusCode] = (acc[log.statusCode] || 0) + 1;
          return acc;
        }, {})
    };
    
    // Transform popularEndpoints into sorted array
    const sortedEndpoints = Object.entries(summary.popularEndpoints)
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    summary.popularEndpoints = sortedEndpoints;
    
    res.json(summary);
  } catch (error) {
    console.error('Error generating log summary:', error);
    res.status(500).json({ error: 'Failed to generate log summary' });
  }
};
EOF
echo "Created admin controller"

# Create admin routes file
cat > poliq-backend/src/api/admin/admin.routes.js << 'EOF'
// src/api/admin/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('./admin.controller');
const { auth } = require('../middlewares/auth.middleware');
const { adminAuth } = require('../middlewares/admin.middleware');

// Protect all admin routes with authentication middleware
router.use(auth);
router.use(adminAuth);

// Connection logs routes
router.get('/connections/active', adminController.getActiveSessions);
router.get('/connections/logs', adminController.getRecentLogs);
router.get('/connections/summary', adminController.getLogSummary);

module.exports = router;
EOF
echo "Created admin routes"

# Update main routes file to include admin routes
cat > poliq-backend/src/api/routes.js << 'EOF'
// src/api/routes.js
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth.routes');
const adminRoutes = require('./admin/admin.routes');

// Basic route to test
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Mount auth routes
router.use('/auth', authRoutes);

// Mount admin routes
router.use('/admin', adminRoutes);

module.exports = router;
EOF
echo "Updated main routes file"

# Enhanced connection logger
cat > poliq-backend/src/utils/connectionLogger.js << 'EOF'
// src/utils/connectionLogger.js
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const geoip = require('geoip-lite');
const { v4: uuidv4 } = require('uuid');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create access log file stream
const getLogFilePath = () => {
  return path.join(logsDir, `access-${format(new Date(), 'yyyy-MM-dd')}.log`);
};

let accessLogStream;
try {
  accessLogStream = fs.createWriteStream(getLogFilePath(), { flags: 'a' });
} catch (error) {
  console.error('Error creating log stream:', error);
  // Fallback to just logging to console
  accessLogStream = {
    write: (message) => console.log('[LOG]', message)
  };
}

// Map to track active sessions
const activeSessions = new Map();

// Parse user agent to extract browser and device info
const parseUserAgent = (userAgent) => {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };
  
  let browser = 'Unknown';
  let device = 'Unknown';
  
  // Very basic browser detection
  if (userAgent.includes('Firefox/')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg/')) {
    browser = 'Edge';
  } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
    browser = 'Internet Explorer';
  }
  
  // Basic device detection
  if (userAgent.includes('Mobile')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    device = 'Tablet';
  } else {
    device = 'Desktop';
  }
  
  return { browser, device };
};

// Get location info from IP
const getLocationInfo = (ip) => {
  try {
    // Skip localhost and private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Local', region: 'Local' };
    }
    
    const geo = geoip.lookup(ip);
    if (geo) {
      return {
        country: geo.country || 'Unknown',
        city: geo.city || 'Unknown',
        region: geo.region || 'Unknown'
      };
    }
  } catch (error) {
    console.error('Error looking up location:', error);
  }
  
  return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
};

// Middleware to log connections
const connectionLogger = (req, res, next) => {
  // Get the real IP address (handles proxies)
  const ip = req.headers['x-forwarded-for'] || 
             req.headers['x-real-ip'] || 
             req.connection.remoteAddress || 
             'Unknown';
             
  const cleanIp = ip.split(',')[0].trim();
  
  // Get or create session ID
  let sessionId = req.cookies?.sessionId;
  if (!sessionId) {
    sessionId = uuidv4();
    res.cookie('sessionId', sessionId, { 
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
  }
  
  // Timestamp
  const timestamp = new Date().toISOString();
  
  // Parse user agent
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const { browser, device } = parseUserAgent(userAgent);
  
  // Get location info
  const location = getLocationInfo(cleanIp);
  
  // Request details
  const method = req.method;
  const url = req.originalUrl || req.url;
  const referer = req.headers.referer || req.headers.referrer || '-';
  
  // Track session
  if (!activeSessions.has(sessionId)) {
    // New session
    activeSessions.set(sessionId, {
      id: sessionId, // Add ID field so we can use it as a key in React
      ip: cleanIp,
      firstSeen: timestamp,
      lastSeen: timestamp,
      browser,
      device,
      location,
      requestCount: 1
    });
    
    // Log new session
    const newSessionLog = {
      type: 'new_session',
      timestamp,
      sessionId,
      ip: cleanIp,
      browser,
      device,
      location,
      referer
    };
    
    accessLogStream.write(JSON.stringify(newSessionLog) + '\n');
    console.log(`[NEW SESSION] ${timestamp} - ${cleanIp} - ${browser} on ${device} - ${location.country}, ${location.city}`);
  } else {
    // Update existing session
    const session = activeSessions.get(sessionId);
    session.lastSeen = timestamp;
    session.requestCount++;
    activeSessions.set(sessionId, session);
  }
  
  // Log every request
  const requestLog = {
    type: 'request',
    timestamp,
    sessionId,
    ip: cleanIp,
    method,
    url,
    browser,
    device,
    referer
  };
  
  accessLogStream.write(JSON.stringify(requestLog) + '\n');
  
  // Start time for measuring response time
  const startTime = process.hrtime();
  
  // When response finishes
  res.on('finish', () => {
    const duration = process.hrtime(startTime);
    const responseTimeMs = (duration[0] * 1000 + duration[1] / 1000000).toFixed(2);
    
    // Log response
    const responseLog = {
      type: 'response',
      timestamp: new Date().toISOString(),
      sessionId,
      ip: cleanIp,
      url,
      statusCode: res.statusCode,
      responseTime: responseTimeMs
    };
    
    accessLogStream.write(JSON.stringify(responseLog) + '\n');
  });
  
  // Clean up old sessions every hour
  if (Math.random() < 0.01) { // Only do cleanup occasionally (1% of requests)
    cleanupOldSessions();
  }
  
  next();
};

// Clean up sessions older than 24 hours
const cleanupOldSessions = () => {
  const now = new Date();
  const oldSessionThreshold = 24 * 60 * 60 * 1000; // 24 hours in ms
  
  for (const [id, session] of activeSessions.entries()) {
    const lastSeenDate = new Date(session.lastSeen);
    if (now - lastSeenDate > oldSessionThreshold) {
      activeSessions.delete(id);
    }
  }
};

// Function to get active sessions (for admin dashboard)
const getActiveSessions = () => {
  return Array.from(activeSessions.entries()).map(([id, session]) => ({
    id,
    ...session,
    durationMinutes: Math.round((new Date() - new Date(session.firstSeen)) / 60000)
  }));
};

// Utility function to get current day's log file
const getCurrentLogFile = () => {
  return getLogFilePath();
};

// Function to read log file lines
const readLogs = (limit = 100) => {
  try {
    const logFile = getCurrentLogFile();
    if (!fs.existsSync(logFile)) {
      return [];
    }
    
    const fileContent = fs.readFileSync(logFile, 'utf8');
    const lines = fileContent.split('\n').filter(line => line.trim() !== '');
    
    // Get the most recent logs up to the limit
    return lines.slice(-limit).map(line => {
      try {
        return JSON.parse(line);
      } catch (e) {
        return { error: 'Invalid log entry', raw: line };
      }
    });
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
};

module.exports = {
  connectionLogger,
  getActiveSessions,
  readLogs
};
EOF
echo "Enhanced the connection logger"

# Create environment file for frontend
mkdir -p poliq-frontend
cat > poliq-frontend/.env.local << 'EOF'
VITE_API_URL=http://localhost:3000/api
EOF
echo "Created frontend environment file"

# Copy fixed AdminDashboard.jsx file
mkdir -p poliq-frontend/src/pages
cat > poliq-frontend/src/pages/AdminDashboard.jsx << 'EOF'
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

// Get API URL from environment variables with fallback
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Active Connection Card Component
const ConnectionCard = ({ session }) => {
  const timeSince = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " seconds";
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-white">{session.ip}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${
          session.device === 'Mobile' 
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' 
            : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300'
        }`}>
          {session.device}
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
        <p>
          <span className="font-medium">Browser:</span> {session.browser}
        </p>
        <p>
          <span className="font-medium">Location:</span> {session.location.city}, {session.location.country}
        </p>
        <p>
          <span className="font-medium">First seen:</span> {timeSince(session.firstSeen)} ago
        </p>
        <p>
          <span className="font-medium">Last activity:</span> {timeSince(session.lastSeen)} ago
        </p>
        <p>
          <span className="font-medium">Requests:</span> {session.requestCount}
        </p>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')} ${color.replace('border', 'text')}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Log Entry Component
const LogEntry = ({ log }) => {
  const getLogTypeStyle = (type) => {
    switch (type) {
      case 'new_session':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300';
      case 'request':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300';
      case 'response':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className={`text-xs px-2 py-1 rounded-full mr-2 ${getLogTypeStyle(log.type)}`}>
            {log.type}
          </span>
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            {new Date(log.timestamp).toLocaleString()}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400 text-sm">{log.ip}</span>
      </div>
      
      <div className="mt-1 text-sm">
        {log.type === 'request' && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <span className={`font-medium mr-2 ${
              log.method === 'GET' ? 'text-green-600 dark:text-green-400' :
              log.method === 'POST' ? 'text-blue-600 dark:text-blue-400' :
              log.method === 'PUT' ? 'text-yellow-600 dark:text-yellow-400' :
              log.method === 'DELETE' ? 'text-red-600 dark:text-red-400' :
              'text-gray-600 dark:text-gray-400'
            }`}>{log.method}</span>
            <span>{log.url}</span>
          </div>
        )}
        
        {log.type === 'response' && (
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <span className={`font-medium mr-2 ${
              log.statusCode < 300 ? 'text-green-600 dark:text-green-400' :
              log.statusCode < 400 ? 'text-blue-600 dark:text-blue-400' :
              log.statusCode < 500 ? 'text-yellow-600 dark:text-yellow-400' :
              'text-red-600 dark:text-red-400'
            }`}>{log.statusCode}</span>
            <span>{log.responseTime} ms</span>
          </div>
        )}
        
        {log.type === 'new_session' && (
          <div className="text-gray-700 dark:text-gray-300">
            {log.browser} on {log.device} from {log.location.city}, {log.location.country}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Dashboard Component
const AdminDashboard = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [logs, setLogs] = useState({ newSessions: [], requests: [], responses: [] });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');
  const [logFilter, setLogFilter] = useState(null);
  const { isAuthenticated, user, token } = useSelector(state => state.auth);
  
  // Create axios instance with authentication header
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // Function to fetch all admin data (active sessions, logs, summary)
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Make parallel requests for better performance
      const [sessionsRes, logsRes, summaryRes] = await Promise.all([
        api.get('/admin/connections/active'),
        api.get('/admin/connections/logs'),
        api.get('/admin/connections/summary')
      ]);
      
      setActiveSessions(sessionsRes.data.sessions || []);
      
      // Process logs based on the backend response structure
      const logsData = logsRes.data.groupedLogs || {};
      setLogs({
        newSessions: logsData.newSessions || [],
        requests: logsData.requests || [],
        responses: logsData.responses || []
      });
      
      setSummary(summaryRes.data || null);
      setError(null);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError(err.response?.data?.error || "Failed to load admin dashboard data");
      toast.error("Failed to load admin dashboard data");
      
      // If backend isn't available, fall back to mock data in development
      if (process.env.NODE_ENV === 'development') {
        useMockData();
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Fallback to use mock data when backend is not available (development only)
  const useMockData = () => {
    console.log("Using mock data for development");
    
    // Mock active sessions
    const mockSessions = [
      {
        id: '1',
        ip: '192.168.1.1',
        browser: 'Chrome',
        device: 'Desktop',
        requestCount: 24,
        firstSeen: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        lastSeen: new Date(Date.now() - 60000 * 5).toISOString(),    // 5 minutes ago
        location: { city: 'New York', country: 'USA' }
      },
      {
        id: '2',
        ip: '172.16.254.1',
        browser: 'Firefox',
        device: 'Desktop',
        requestCount: 12,
        firstSeen: new Date(Date.now() - 3600000 * 1).toISOString(), // 1 hour ago
        lastSeen: new Date(Date.now() - 60000 * 2).toISOString(),    // 2 minutes ago
        location: { city: 'San Francisco', country: 'USA' }
      },
      {
        id: '3',
        ip: '10.0.0.1',
        browser: 'Safari',
        device: 'Mobile',
        requestCount: 8,
        firstSeen: new Date(Date.now() - 3600000 * 0.5).toISOString(), // 30 mins ago
        lastSeen: new Date(Date.now() - 60000 * 1).toISOString(),      // 1 minute ago
        location: { city: 'London', country: 'UK' }
      }
    ];
    
    // Mock logs
    const mockLogs = {
      newSessions: [
        {
          type: 'new_session',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          sessionId: '1',
          ip: '192.168.1.1',
          browser: 'Chrome',
          device: 'Desktop',
          location: { city: 'New York', country: 'USA' }
        },
        {
          type: 'new_session',
          timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
          sessionId: '2',
          ip: '172.16.254.1',
          browser: 'Firefox',
          device: 'Desktop',
          location: { city: 'San Francisco', country: 'USA' }
        }
      ],
      requests: [
        {
          type: 'request',
          timestamp: new Date(Date.now() - 60000 * 10).toISOString(),
          sessionId: '1',
          ip: '192.168.1.1',
          method: 'GET',
          url: '/api/questions',
          browser: 'Chrome',
          device: 'Desktop'
        },
        {
          type: 'request',
          timestamp: new Date(Date.now() - 60000 * 8).toISOString(),
          sessionId: '2',
          ip: '172.16.254.1',
          method: 'POST',
          url: '/api/auth/login',
          browser: 'Firefox',
          device: 'Desktop'
        }
      ],
      responses: [
        {
          type: 'response',
          timestamp: new Date(Date.now() - 60000 * 9.9).toISOString(),
          sessionId: '1',
          ip: '192.168.1.1',
          url: '/api/questions',
          statusCode: 200,
          responseTime: '125.8'
        },
        {
          type: 'response',
          timestamp: new Date(Date.now() - 60000 * 7.9).toISOString(),
          sessionId: '2',
          ip: '172.16.254.1',
          url: '/api/auth/login',
          statusCode: 200,
          responseTime: '210.3'
        }
      ]
    };
    
    // Mock summary
    const mockSummary = {
      totalRequests: 36,
      uniqueIPs: 12,
      averageResponseTime: 156.7,
      popularEndpoints: [
        { url: '/api/questions', count: 14 },
        { url: '/api/auth/login', count: 8 },
        { url: '/api/questions/1', count: 6 },
        { url: '/api/auth/register', count: 4 }
      ],
      statusCodes: {
        200: 30,
        401: 2,
        404: 3,
        500: 1
      }
    };
    
    setActiveSessions(mockSessions);
    setLogs(mockLogs);
    setSummary(mockSummary);
    toast.info("Using mock data - connect your backend for real data");
  };
  
  // Fetch data on component mount and when user or token changes
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin' && token) {
      fetchAdminData();
      
      // Set up polling to refresh data every 30 seconds
      const interval = setInterval(fetchAdminData, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, token]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchAdminData();
    toast.success('Data refreshed');
  };
  
  // Require admin access
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            You don't have admin privileges to access this page.
          </p>
          <Button to="/" variant="primary">Return to Home</Button>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4 mb-6"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Admin Dashboard
        </h1>
        
        <div className="flex space-x-2">
          <Button 
            variant={tab === 'overview' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTab('overview')}
          >
            Overview
          </Button>
          <Button 
            variant={tab === 'connections' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTab('connections')}
          >
            Active Connections
          </Button>
          <Button 
            variant={tab === 'logs' ? 'primary' : 'secondary'} 
            size="sm"
            onClick={() => setTab('logs')}
          >
            Logs
          </Button>
        </div>
      </div>
      
      {tab === 'overview' && (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard 
              title="Active Sessions" 
              value={activeSessions.length} 
              color="border-blue-500"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            
            <StatsCard 
              title="Total Requests" 
              value={summary?.totalRequests || 0} 
              color="border-green-500"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
            />
            
            <StatsCard 
              title="Unique IPs" 
              value={summary?.uniqueIPs || 0} 
              color="border-yellow-500"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            
            <StatsCard 
              title="Avg Response Time" 
              value={`${summary?.averageResponseTime?.toFixed(2) || 0} ms`} 
              color="border-purple-500"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
          
          {/* Popular endpoints and device breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:col-span-2">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Popular Endpoints</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Endpoint
                      </th>
                      <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Requests
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {summary?.popularEndpoints?.map(endpoint => (
                      <tr key={endpoint.url} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {endpoint.url}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-300">
                          <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">
                            {endpoint.count}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {!summary?.popularEndpoints?.length && (
                      <tr>
                        <td colSpan="2" className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Device Breakdown</h3>
              {activeSessions.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(
                    activeSessions.reduce((acc, session) => {
                      acc[session.device] = (acc[session.device] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([device, count]) => (
                    <div key={device} className="flex items-center">
                      <span className="text-sm text-gray-700 dark:text-gray-300 w-20">{device}</span>
                      <div className="flex-1 ml-4">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${
                              device === 'Desktop' ? 'bg-blue-600 dark:bg-blue-500' :
                              device === 'Mobile' ? 'bg-green-600 dark:bg-green-500' :
                              'bg-yellow-600 dark:bg-yellow-500'
                            }`}
                            style={{ width: `${(count / activeSessions.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-4 text-sm text-gray-700 dark:text-gray-300">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">No active sessions</p>
              )}
            </div>
          </div>
          
          {/* Status codes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Status Codes</h3>
            
            {Object.keys(summary?.statusCodes || {}).length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {Object.entries(summary.statusCodes).map(([code, count]) => (
                  <div key={code} className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                      code < 300 ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
                      code < 400 ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300' :
                      code < 500 ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
                      'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                    }`}>
                      <span className="text-xl font-bold">{code}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">{count} requests</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">No data available</p>
            )}
          </div>
        </>
      )}
      
      {tab === 'connections' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Active Connections ({activeSessions.length})
            </h2>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          
          {activeSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSessions.map(session => (
                <ConnectionCard key={session.id} session={session} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No active connections</p>
            </div>
          )}
        </div>
      )}
      
      {tab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Logs
            </h2>
            
            <Button 
              variant="secondary" 
              size="sm"
              onClick={handleRefresh}
            >
              Refresh
            </Button>
          </div>
          
          {/* Log filtering tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                tab === 'logs' && !logFilter ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogFilter(null)}
            >
              All Logs
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logFilter === 'newSessions' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogFilter('newSessions')}
            >
              New Sessions
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logFilter === 'requests' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogFilter('requests')}
            >
              Requests
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logFilter === 'responses' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogFilter('responses')}
            >
              Responses
            </button>
          </div>
          
          {/* Log entries */}
          <div className="max-h-96 overflow-y-auto">
            {logFilter ? (
              logs[logFilter]?.length > 0 ? (
                logs[logFilter].map(log => (
                  <LogEntry key={`${log.type}-${log.timestamp}`} log={log} />
                ))
              ) : (
                <p className="text-center py-4 text-gray-500 dark:text-gray-400">No logs available</p>
              )
            ) : (
              // Combine and sort all logs by timestamp (newest first)
              [...(logs.newSessions || []), ...(logs.requests || []), ...(logs.responses || [])]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(log => (
                  <LogEntry key={`${log.type}-${log.timestamp}`} log={log} />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
EOF
echo "Created AdminDashboard.jsx file"

# Create logs directory for backend
mkdir -p poliq-backend/logs
touch poliq-backend/logs/access-$(date +%Y-%m-%d).log
echo "Created logs directory and access log file"

echo "Setup complete!"
echo "To activate, run the following commands:"
echo "1. Install dependencies (if needed):"
echo "   cd poliq-backend && npm install"
echo ""
echo "2. Start the backend server:"
echo "   cd poliq-backend && npm run dev"
echo ""
echo "3. Start the frontend app:"
echo "   cd poliq-frontend && npm run dev"
echo ""
echo "Then login as admin (admin@poliq.com / admin123!) and navigate to the admin dashboard"
