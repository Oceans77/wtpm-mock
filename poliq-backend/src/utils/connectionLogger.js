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
