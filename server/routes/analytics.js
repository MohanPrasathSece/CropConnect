const express = require('express');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/v1/analytics/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    let analytics = {};

    if (req.user.role === 'farmer') {
      // Farmer analytics
      const totalCrops = await Crop.countDocuments({ farmer: req.user.id });
      const soldCrops = await Crop.countDocuments({ farmer: req.user.id, status: 'sold' });
      const activeCrops = await Crop.countDocuments({ farmer: req.user.id, status: { $in: ['harvested', 'listed'] } });

      analytics = {
        totalCrops,
        soldCrops,
        activeCrops,
        successRate: totalCrops > 0 ? ((soldCrops / totalCrops) * 100).toFixed(1) : 0
      };

    } else if (req.user.role === 'admin') {
      // Admin analytics
      const totalUsers = await User.countDocuments();
      const totalCrops = await Crop.countDocuments();
      const totalTransactions = await Transaction.countDocuments();
      const activeUsers = await User.countDocuments({ isActive: true });

      analytics = {
        totalUsers,
        totalCrops,
        totalTransactions,
        activeUsers
      };
    }

    res.json({
      success: true,
      analytics
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error.message
    });
  }
});

module.exports = router;
