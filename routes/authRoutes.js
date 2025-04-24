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

// Twilio SMS verification
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone and verification code are required' });
  }

  // Format phone number to E.164
  const formattedPhone = phone.replace(/\D/g, '');
  const internationalPhone = formattedPhone.startsWith('1')
    ? `+${formattedPhone}`
    : `+1${formattedPhone}`;

  try {
    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verificationChecks.create({
        to: internationalPhone,
        code
      });

    if (verificationCheck.status === 'approved') {
      await User.findOneAndUpdate({ phone }, { phone_verified: true });
      return res.status(200).json({ message: 'Phone verified successfully' });
    } else {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
  } catch (err) {
    console.error('Twilio verify check error:', err.message);
    return res.status(500).json({ message: 'Verification failed. Try again.' });
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
      await User.findOneAndUpdate({ phone }, { phone_verified: true });
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

    const existingUser = await User.findOne({ $or: [{ phone }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, phone, username, password });
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({ message: 'User registered successfully', token });
  } catch (err) {
    console.error("Registration failed:", err);
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
    console.error("Login failed:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
