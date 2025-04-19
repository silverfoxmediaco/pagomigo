// routes/transactionRoutes.js
const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const Transaction = require('../models/Transaction');

// @route   POST /api/transactions/send
// @desc    Send money to recipient
// @access  Private
router.post('/send', requireAuth, async (req, res) => {
  try {
    const { recipientName, recipientCountry, amountUsd } = req.body;

    const transaction = new Transaction({
      senderId: req.user.id,
      recipientName,
      recipientCountry,
      amountUsd,
      status: 'pending',
      createdAt: new Date()
    });

    await transaction.save();
    res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/transactions/history
// @desc    Get all transactions by the logged-in user
// @access  Private
router.get('/history', requireAuth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ senderId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;