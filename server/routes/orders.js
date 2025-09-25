const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');

const router = express.Router();

// @desc    Get orders for a farmer (seller)
// @route   GET /api/v1/orders/farmer/:email
// @access  Public (simplified auth)
router.get('/farmer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find farmer by email
    const farmer = await User.findOne({ email });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Get all orders for this farmer
    const orders = await Order.find({ farmerId: farmer._id })
      .populate('buyerId', 'name email phone')
      .populate('cropId', 'name variety images')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get farmer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @desc    Get orders for a buyer
// @route   GET /api/v1/orders/buyer/:email
// @access  Public (simplified auth)
router.get('/buyer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Find buyer by email
    const buyer = await User.findOne({ email });
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }

    // Get all orders for this buyer
    const orders = await Order.find({ buyerId: buyer._id })
      .populate('farmerId', 'name email phone address')
      .populate('cropId', 'name variety images')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// @desc    Create a new order
// @route   POST /api/v1/orders
// @access  Public (simplified auth)
router.post('/', async (req, res) => {
  try {
    const {
      cropId,
      cropName,
      farmerEmail,
      buyerEmail,
      quantity,
      unit,
      pricePerUnit,
      deliveryAddress,
      notes,
      qualityRequirements,
      expectedDeliveryDate
    } = req.body;

    // Find farmer and buyer
    const farmer = await User.findOne({ email: farmerEmail });
    const buyer = await User.findOne({ email: buyerEmail });

    if (!farmer || !buyer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer or buyer not found'
      });
    }

    // Calculate total amount
    const totalAmount = quantity * pricePerUnit;

    // Create new order
    const order = new Order({
      cropId,
      cropName,
      farmerId: farmer._id,
      farmerName: farmer.name,
      farmerEmail: farmer.email,
      buyerId: buyer._id,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      quantity,
      unit,
      pricePerUnit,
      totalAmount,
      deliveryAddress,
      notes,
      qualityRequirements,
      expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days default
    });

    // Add initial tracking update
    order.trackingUpdates.push({
      status: 'pending',
      message: 'Order placed successfully',
      location: deliveryAddress?.district || ''
    });

    await order.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
});

// @desc    Update order status
// @route   PUT /api/v1/orders/:orderId/status
// @access  Public (simplified auth)
router.put('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, message, location, userEmail } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Verify user is either farmer or buyer
    const user = await User.findOne({ email: userEmail });
    if (!user || (user._id.toString() !== order.farmerId.toString() && user._id.toString() !== order.buyerId.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this order'
      });
    }

    // Update status with tracking
    await order.updateStatus(status, message, location);

    // Update delivery date if delivered
    if (status === 'delivered' && !order.actualDeliveryDate) {
      order.actualDeliveryDate = new Date();
      await order.save();
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// @desc    Get single order details
// @route   GET /api/v1/orders/:orderId
// @access  Public (simplified auth)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId })
      .populate('farmerId', 'name email phone address')
      .populate('buyerId', 'name email phone address')
      .populate('cropId', 'name variety images description');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
});

// @desc    Add rating and feedback
// @route   PUT /api/v1/orders/:orderId/rating
// @access  Public (simplified auth)
router.put('/:orderId/rating', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userEmail, rating, feedback, ratingType } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is farmer or buyer and update appropriate rating
    if (user._id.toString() === order.farmerId.toString() && ratingType === 'buyer') {
      order.buyerRating = { rating, feedback };
    } else if (user._id.toString() === order.buyerId.toString() && ratingType === 'farmer') {
      order.farmerRating = { rating, feedback };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to rate this order'
      });
    }

    await order.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      order
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating',
      error: error.message
    });
  }
});

// @desc    Get order statistics for farmer
// @route   GET /api/v1/orders/farmer/:email/stats
// @access  Public (simplified auth)
router.get('/farmer/:email/stats', async (req, res) => {
  try {
    const { email } = req.params;
    
    const farmer = await User.findOne({ email });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Get order statistics
    const totalOrders = await Order.countDocuments({ farmerId: farmer._id });
    const pendingOrders = await Order.countDocuments({ farmerId: farmer._id, status: 'pending' });
    const completedOrders = await Order.countDocuments({ farmerId: farmer._id, status: 'delivered' });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      { $match: { farmerId: farmer._id, status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get recent orders
    const recentOrders = await Order.find({ farmerId: farmer._id })
      .populate('buyerId', 'name')
      .sort({ orderDate: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Get farmer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

module.exports = router;
