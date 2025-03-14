const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock database for users
const users = [];

// JWT Secret
const JWT_SECRET = 'your_jwt_secret_for_development';

// Auth middleware
const authMiddleware = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to PoliQ Backend API' });
});

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username, displayName } = req.body;

    // Validate input
    if (!email || !password || !username || !displayName) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if username is taken
    const existingUsername = users.find(user => user.username === username);
    if (existingUsername) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create new user object
    const newUser = {
      id: uuidv4(),
      email,
      username,
      displayName,
      verificationStatus: 'unverified',
      createdAt: new Date(),
      lastLoginAt: null
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user to mock database
    users.push(newUser);

    // Create JWT token
    const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '1d' });

    // Return user info (excluding password) and token
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        displayName: newUser.displayName,
        verificationStatus: newUser.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter all fields' });
    }

    // Check if user exists
    const user = users.find(user => user.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLoginAt = new Date();

    // Create JWT token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    // Return user info and token
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        verificationStatus: user.verificationStatus
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
  try {
    // Find user by ID
    const user = users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info (excluding password)
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      verificationStatus: user.verificationStatus
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add some mock questions
const questions = [
  {
    id: uuidv4(),
    content: "Why hasn't Congress addressed the rising cost of healthcare for middle-class Americans?",
    categoryIds: ["healthcare", "federal"],
    userId: "system",
    votes: 4382,
    comments: 243,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    addressed: false
  },
  {
    id: uuidv4(),
    content: "What specific plans does the administration have to address inflation?",
    categoryIds: ["economy", "federal"],
    userId: "system",
    votes: 3928,
    comments: 187,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    addressed: false
  },
  {
    id: uuidv4(),
    content: "How will the new infrastructure bill specifically help rural communities?",
    categoryIds: ["infrastructure", "rural"],
    userId: "system",
    votes: 3541,
    comments: 156,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    addressed: false
  }
];

// Get trending questions
app.get('/api/questions/trending', (req, res) => {
  // Sort by votes (descending)
  const trendingQuestions = [...questions].sort((a, b) => b.votes - a.votes);
  res.json(trendingQuestions);
});

// Get question details
app.get('/api/questions/:id', (req, res) => {
  const question = questions.find(q => q.id === req.params.id);
  
  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }
  
  res.json(question);
});

// Submit a new question
app.post('/api/questions', authMiddleware, (req, res) => {
  try {
    const { content, categoryIds } = req.body;
    
    if (!content || !categoryIds || categoryIds.length === 0) {
      return res.status(400).json({ error: 'Please provide content and categories' });
    }
    
    const newQuestion = {
      id: uuidv4(),
      content,
      categoryIds,
      userId: req.user.id,
      votes: 0,
      comments: 0,
      createdAt: new Date(),
      addressed: false
    };
    
    questions.push(newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Error submitting question:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to access the API`);
});
