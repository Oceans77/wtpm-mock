// src/pages/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import { toast } from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

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
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const { isAuthenticated, user } = useSelector(state => state.auth);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active sessions
        const sessionsResponse = await axios.get(`${API_URL}/admin/connections/active`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch recent logs
        const logsResponse = await axios.get(`${API_URL}/admin/connections/logs?limit=100`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Fetch summary
        const summaryResponse = await axios.get(`${API_URL}/admin/connections/summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        setActiveSessions(sessionsResponse.data.sessions);
        setLogs(logsResponse.data.groupedLogs);
        setSummary(summaryResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    if (isAuthenticated && user?.role === 'admin') {
      fetchData();
      
      // Set up polling to refresh data
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);
  
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
              onClick={() => {
                // Refresh data
                setLoading(true);
                axios.get(`${API_URL}/admin/connections/active`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                  .then(response => {
                    setActiveSessions(response.data.sessions);
                    setLoading(false);
                    toast.success('Connections refreshed');
                  })
                  .catch(error => {
                    console.error('Error refreshing connections:', error);
                    toast.error('Failed to refresh connections');
                    setLoading(false);
                  });
              }}
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
              onClick={() => {
                // Refresh logs
                setLoading(true);
                axios.get(`${API_URL}/admin/connections/logs?limit=100`, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                })
                  .then(response => {
                    setLogs(response.data.groupedLogs);
                    setLoading(false);
                    toast.success('Logs refreshed');
                  })
                  .catch(error => {
                    console.error('Error refreshing logs:', error);
                    toast.error('Failed to refresh logs');
                    setLoading(false);
                  });
              }}
            >
              Refresh
            </Button>
          </div>
          
          {/* Log filtering tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
            <button
              className={`py-2 px-4 text-sm font-medium ${
                tab === 'logs' && !logs.filter ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogs({ ...logs, filter: null })}
            >
              All Logs
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logs.filter === 'newSessions' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogs({ ...logs, filter: 'newSessions' })}
            >
              New Sessions
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logs.filter === 'requests' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogs({ ...logs, filter: 'requests' })}
            >
              Requests
            </button>
            <button
              className={`py-2 px-4 text-sm font-medium ${
                logs.filter === 'responses' ? 
                'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' :
                'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setLogs({ ...logs, filter: 'responses' })}
            >
              Responses
            </button>
          </div>
          
          {/* Log entries */}
          <div className="max-h-96 overflow-y-auto">
            {logs.filter ? (
              logs[logs.filter].length > 0 ? (
                logs[logs.filter].map(log => (
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