//New Code
// routes/authRoutes.js
const express = require('express');
const router = express.Router();
//const bcrypt = require('bcrypt');
const User = require('../models/User');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_ID;
const client = twilio(accountSid, authToken);

// Normalize phone to E.164 format
function normalizePhone(input) {
  const digits = input.replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, username, phone, password } = req.body;
    if (!name || !username || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      return res.status(409).json({ message: 'Phone number already registered.' });
    }

    // (Temp disable) const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      username,
      phone: normalizedPhone,
      password,
      verified: false
    });

    await user.save();
    res.status(201).json({ message: 'Account created!' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

// Send verification code using Twilio
router.post('/send-verification', async (req, res) => {
  try {
    const { phone } = req.body;
    const normalizedPhone = normalizePhone(phone);

    const verification = await client.verify.v2.services(verifySid).verifications.create({
      to: normalizedPhone,
      channel: 'sms'
    });

    res.status(200).json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Twilio send error:', err);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
});

// Verify submitted code via Twilio
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ message: 'Phone and verification code are required' });
  }

  const normalizedPhone = normalizePhone(phone);

  try {
    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({
        to: normalizedPhone,
        code
      });

    if (verificationCheck.status === 'approved') {
      const user = await User.findOneAndUpdate(
        { phone: normalizedPhone },
        { phone_verified: true },
        { new: true }
      );

      req.session.userId = user._id; // Save user session
      console.log('User session saved:', req.session.userId);
      console.log('User verified:', user);

      return res.status(200).json({ message: 'Phone verified successfully', user });
    } else {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
  } catch (err) {
    console.error('Twilio verify check error:', err.message);
    return res.status(500).json({ message: 'Verification failed. Try again.' });
  }
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required.' });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await User.findOne({ $or: [{ phone }, { phone: normalizedPhone }]});
    console.log('Login attempt:');
    console.log('Raw phone:', phone);
    console.log('Normalized phone:', normalizedPhone);
    console.log('User found:', !!user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
      
    }console.log('Entered password:', password);
    console.log('Stored hash:', user.password);

    //const isMatch = await bcrypt.compare(password, user.password);
    //console.log('Password match:', isMatch);
    // Check if the password matches
    // temp change (!isMatch)
    if (password !== user.password) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Save user session
    req.session.userId = user._id;

    res.status(200).json({ message: 'Login successful.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ message: 'Failed to logout.' });
    }
    res.clearCookie('connect.sid', { path: '/' });
    res.status(200).json({ message: 'Logged out successfully.' });
  });
});


module.exports = router;



//Old code
// routes/authRoutes.js
/*const express = require('express');
const User = require('../models/User');
const router = express.Router();
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Twilio SMS verification
router.post('/verify-code', async (req, res) => {
  const { phone, code } = req.body;
console.log("Using Twilio Verify SID:", process.env.TWILIO_VERIFY_SERVICE_ID);
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

// Login Route (session-based)
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    req.session.userId = user._id;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ message: 'Session error' });
      }

      res.status(200).json({ message: 'Login successful' });
    });
  } catch (err) {
    console.error("Login failed:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


  // Send Verification Code
router.post('/send-verification', async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Format phone number to E.164
  const formattedPhone = phone.replace(/\D/g, '');
  const internationalPhone = formattedPhone.startsWith('1')
    ? `+${formattedPhone}`
    : `+1${formattedPhone}`;

  try {
    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_ID)
      .verifications.create({
        to: internationalPhone,
        channel: 'sms'
      });

    res.status(200).json({ message: 'Verification code sent' });
  } catch (err) {
    console.error('Twilio send verification error:', err.message);
    res.status(500).json({ message: 'Failed to send verification code' });
  }
});


module.exports = router;*/

