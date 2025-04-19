// routes/kycRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Webhook endpoint to receive verification updates from Persona
router.post('/webhook', async (req, res) => {
  try {
    const event = req.body;

    if (!event || !event.data || !event.data.attributes || !event.data.relationships) {
      return res.status(400).json({ message: 'Invalid webhook payload' });
    }

    const { status } = event.data.attributes;
    const userId = event.data.attributes.reference_id; // this should be your internal user ID

    if (!userId) {
      return res.status(400).json({ message: 'Missing reference ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update KYC status
    user.kyc_status = status; // e.g., 'completed', 'failed', 'pending'
    await user.save();

    res.status(200).json({ message: 'Webhook received and user updated' });
  } catch (error) {
    console.error('KYC webhook error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

