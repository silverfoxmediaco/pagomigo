// routes/authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};


//Twilio SMS verification
router.post('/send-verification', async (req, res) => {
  const { phone } = req.body;

  if (!phone) return res.status(400).json({ message: 'Phone number is required' });

  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({
        to: phone,
        channel: 'sms'
      });
      res.status(200).json({ message: 'Verification code sent', sid: verification.sid });
  } catch (err) {
    console.error('Twilio verification error:', err.message);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});

  // Confirm SMS code
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone and verification code are required' });
  }

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: phone,
        code
      });

    if (verificationCheck.status === 'approved') {
      // Optionally update user in DB
      await User.findOneAndUpdate({ phone }, { phoneVerified: true });

      return res.status(200).json({ message: 'Phone verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
  } catch (err) {
    console.error('Twilio verify check error:', err.message);
    return res.status(500).json({ message: 'Verification failed. Try again.' });
  }
});



// Register Route
router.post('/register', async (req, res) => {
  try {
    const { name, phone, username, password } = req.body;
    if (!name || !phone || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ phone }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, phone, username, password });
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
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
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
