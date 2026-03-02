const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { protect, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

/**
 * @route   GET /api/v1/retailer/dashboard
 * @desc    Get retailer dashboard stats
 * @access  Private (Retailer only)
 */
router.get('/dashboard', protect, authorize('retailer'), async (req, res) => {
    try {
        const retailerId = req.user.id;

        // 1. Get orders stats
        const { data: orders, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('buyer_id', retailerId);

        if (orderError) throw orderError;

        // 2. Calculate metrics
        const totalSpent = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0) || 0;
        const activeOrders = orders?.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length || 0;
        const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;

        // 3. Get recent activity (recent orders)
        const recentActivity = orders?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .map(o => ({
                id: o.id,
                text: `Ordered batch #${o.order_id.slice(-6)}`,
                status: o.status,
                time: getTimeAgo(new Date(o.created_at))
            })) || [];

        // 4. Mock chart data for inventory/spending levels
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const chartData = months.map(month => ({
            month,
            spending: Math.floor(Math.random() * 5000) + 2000,
            inventory: Math.floor(Math.random() * 100) + 50
        }));

        res.json({
            success: true,
            data: {
                stats: {
                    activeOrders,
                    completedOrders,
                    totalSpent: `₹${totalSpent.toLocaleString()}`,
                    inventoryHealth: '94%' // Mocked metric
                },
                chartData,
                recentActivity
            }
        });

    } catch (error) {
        console.error('Retailer dashboard error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/v1/retailer/marketplace
 * @desc    Get available collections for retailers to buy
 * @access  Private (Retailer only)
 */
router.get('/marketplace', protect, authorize('retailer'), async (req, res) => {
    try {
        const { category, search } = req.query;

        // Look for crops that are listed and available
        // OR look for aggregator collections that are available for sale
        // For this flow, let's assume retailers buy from crops marked as 'listed'
        // but in a more complex app, aggregators list 'collections'

        let query = supabase
            .from('crops')
            .select('*, farmer:profiles(*)')
            .eq('status', 'listed')
            .eq('is_active', true)
            .or('availability.eq.available,availability.is.null');

        if (category) query = query.eq('category', category);
        if (search) query = query.ilike('name', `%${search}%`);

        const { data: crops, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: crops
        });

    } catch (error) {
        console.error('Retailer marketplace error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   POST /api/v1/retailer/order
 * @desc    Create a new order for a crop
 * @access  Private (Retailer only)
 */
router.post('/order', protect, authorize('retailer'), [
    body('cropId').notEmpty(),
    body('quantity').isNumeric(),
    body('deliveryAddress').notEmpty()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { cropId, quantity, deliveryAddress, notes, blockchainTx } = req.body;
        const buyerId = req.user.id;

        // 1. Verify crop availability
        const { data: crop, error: cropError } = await supabase
            .from('crops')
            .select('*')
            .eq('id', cropId)
            .single();

        if (cropError || !crop) {
            return res.status(404).json({ success: false, message: 'Crop not found' });
        }

        if (crop.quantity < quantity) {
            return res.status(400).json({ success: false, message: 'Insufficient quantity available' });
        }

        // 2. Create order
        const orderId = `ORD-${Date.now()}`;
        const totalAmount = quantity * crop.price_per_unit;

        // If blockchainTx is present, we refine the payment status
        const paymentStatus = blockchainTx ? 'escrowed' : 'pending';
        const finalNotes = blockchainTx
            ? `${notes || ''}\n[⛓️ BLOCKCHAIN ESCROW ACTIVE]\nTx Hash: ${blockchainTx.hash}\nAmount: ${blockchainTx.amountEth} ETH`.trim()
            : notes;

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([{
                order_id: orderId,
                crop_id: cropId,
                seller_id: crop.farmer_id,
                buyer_id: buyerId,
                quantity,
                unit: crop.unit,
                price_per_unit: crop.price_per_unit,
                total_amount: totalAmount,
                status: 'pending',
                delivery_address: deliveryAddress,
                notes: finalNotes || '',
                payment_status: paymentStatus,
                payment_method: blockchainTx ? 'escrow' : (req.body.paymentMethod || 'cash')
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // Send notifications
        try {
            const { createNotification } = require('../utils/notifications');
            // Notify Farmer (Seller)
            await createNotification(
                crop.farmer_id,
                'New Order Received! 📦',
                `You have a new order for ${quantity} ${crop.unit} of ${crop.name}. Order ID: ${orderId}`,
                'success',
                '/farmer/orders'
            );
            // Notify Retailer (Buyer)
            await createNotification(
                buyerId,
                'Order Placed Successfully ✅',
                `Your order for ${crop.name} has been placed. Payment Status: ${paymentStatus.toUpperCase()}`,
                'success',
                '/retailer/orders'
            );
        } catch (notifyError) {
            console.error('Order notification failed:', notifyError);
        }

        // 3. Update crop quantity
        const newQuantity = crop.quantity - quantity;
        const updateData = { quantity: newQuantity };
        if (newQuantity <= 0) {
            updateData.availability = 'sold_out';
            updateData.status = 'sold';
        }

        await supabase
            .from('crops')
            .update(updateData)
            .eq('id', cropId);

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            data: order
        });

    } catch (error) {
        console.error('Retailer order error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/v1/retailer/orders
 * @desc    Get retailer's order history
 * @access  Private (Retailer only)
 */
router.get('/orders', protect, authorize('retailer'), async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, crop:crops(*), farmer:profiles!orders_seller_id_fkey(*)')
            .eq('buyer_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Retailer orders fetch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

/**
 * @route   GET /api/v1/retailer/trace/:id
 * @desc    Get traceability for an ordered product
 * @access  Private (Retailer only)
 */
router.get('/trace/:id', protect, authorize('retailer'), async (req, res) => {
    try {
        const { id } = req.params;

        // Look for collection record if it exists (meaning it passed through an aggregator)
        // Or look at the crop directly

        const { data: crop, error: cropError } = await supabase
            .from('crops')
            .select('*, farmer:profiles(*)')
            .eq('id', id)
            .single();

        if (cropError || !crop) {
            // Try searching by order id or traceability id
            // For now, let's assume id is crop_id
            return res.status(404).json({ success: false, message: 'Product traceability data not found' });
        }

        // Try to find if an aggregator collected this
        const { data: collection } = await supabase
            .from('collections')
            .select('*, aggregator:profiles(*)')
            .eq('source_crop_id', crop.id)
            .single();

        const chain = [
            {
                stage: 'Farming & Harvest',
                actor: crop.farmer?.name,
                location: crop.farm_location,
                date: crop.harvest_date,
                status: 'completed',
                details: `Harvested ${crop.quantity}${crop.unit} of ${crop.name}`
            }
        ];

        if (collection) {
            chain.push({
                stage: 'Regional Collection',
                actor: collection.aggregator?.name,
                location: collection.collection_location,
                date: collection.collection_date,
                status: 'completed',
                details: `Quality certified: ${collection.quality_assessment?.overallGrade}`
            });
        }

        res.json({
            success: true,
            data: {
                product: {
                    name: crop.name,
                    variety: crop.variety,
                    traceId: crop.traceability_id
                },
                chain
            }
        });

    } catch (error) {
        console.error('Retailer trace error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Helper for time ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}

module.exports = router;
