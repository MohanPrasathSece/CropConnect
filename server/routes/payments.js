const express = require('express');
const supabase = require('../config/supabase');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Create payment transaction (Mock/Placeholder)
// @route   POST /api/v1/payments
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    // In this implementation, payments are handled via Orders
    // This endpoint is kept for compatibility if needed
    const { orderId, amount, paymentMethod } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // Update order payment status
    const { data: order, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'completed',
        payment_method: paymentMethod || 'manual',
        updated_at: new Date()
      })
      .eq('order_id', orderId) // Assuming orderId passed is the string ID
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Payment recorded via Order update',
      transaction: order
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
});

// @desc    Get user transactions (derived from Orders)
// @route   GET /api/v1/payments/my-transactions
// @access  Private
router.get('/my-transactions', protect, async (req, res) => {
  try {
    // Fetch orders where user is buyer or seller
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, crop:crops(*), buyer:profiles!orders_buyer_id_fkey(*), seller:profiles!orders_seller_id_fkey(*)')
      .or(`buyer_id.eq.${req.user.id},seller_id.eq.${req.user.id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map orders to transaction-like structure
    const transactions = orders.map(order => ({
      _id: order.id,
      crop: order.crop,
      buyer: order.buyer,
      seller: order.seller,
      quantity: order.quantity,
      pricePerUnit: order.price_per_unit,
      totalAmount: order.total_amount,
      status: order.status,
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      notes: order.notes
    }));

    res.json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transactions',
      error: error.message
    });
  }
});

module.exports = router;
