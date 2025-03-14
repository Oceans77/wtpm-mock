const express = require('express');
const router = express.Router();

// Basic route to test
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

module.exports = router;
