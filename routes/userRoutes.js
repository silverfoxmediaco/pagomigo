// routes/userRoutes.js
/*const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

// @route   GET /api/user/profile
// @desc    Get authenticated user dashboard data
// @access  Private
router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      kyc_status: user.kyc_status,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;*/

// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const requireAuth = require('../middleware/requireAuth');

router.get('/profile', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      name: user.name,
      phone: user.phone,
      email: user.email,
      kyc_status: user.kyc_status,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

