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
