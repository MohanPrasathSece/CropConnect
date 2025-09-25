const express = require('express');
const Transaction = require('../models/Transaction');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create payment transaction
// @route   POST /api/v1/payments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      buyer: req.user.id
    });

    await transaction.populate(['crop', 'seller', 'buyer']);

    res.status(201).json({
      success: true,
      message: 'Payment transaction created',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// @desc    Get user transactions
// @route   GET /api/v1/payments/my-transactions
// @access  Private
router.get('/my-transactions', protect, async (req, res) => {
  try {
    const filter = {
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id }
      ]
    };

    const transactions = await Transaction.find(filter)
      .populate(['crop', 'buyer', 'seller'])
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

module.exports = router;
