// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
// This code defines authentication routes for user registration and login.
// It uses Express.js to create a router and Mongoose to interact with a MongoDB database.
// The routes include error handling and JWT generation for secure authentication.
// The register route checks if a user already exists, creates a new user, and generates a JWT token.
// The login route verifies user credentials, generates a JWT token, and returns it to the client.
// This is essential for user authentication in web applications.
