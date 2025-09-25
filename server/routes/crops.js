const express = require('express');
const { body, validationResult } = require('express-validator');
const Crop = require('../models/Crop');
const User = require('../models/User');

const router = express.Router();

// @desc    Create new crop (legacy route - use /upload instead)
// @route   POST /api/v1/crops
// @access  Public (simplified auth)
router.post('/', async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Use /api/v1/crops/upload instead'
    });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating crop'
    });
  }
});

// @route   GET /api/v1/crops/my-crops
// @desc    Get farmer's crops (legacy route)
// @access  Public (simplified auth)
router.get('/my-crops', async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Use /api/v1/crops/farmer/:email instead'
    });
  } catch (error) {
    console.error('Get my crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/crops/marketplace
// @desc    Get marketplace crops with filters
// @access  Public
router.get('/marketplace', async (req, res) => {
  try {
    const {
      category, location, minPrice, maxPrice, isOrganic, search,
      page = 1, limit = 12, sortBy = 'listedAt', sortOrder = 'desc'
    } = req.query;

    const query = { status: 'listed', isActive: true };

    if (category) query.category = category;
    if (location) {
      query.$or = [
        { 'farmLocation.district': new RegExp(location, 'i') },
        { 'farmLocation.state': new RegExp(location, 'i') }
      ];
    }
    if (minPrice) query.pricePerUnit = { $gte: parseFloat(minPrice) };
    if (maxPrice) {
      query.pricePerUnit = query.pricePerUnit || {};
      query.pricePerUnit.$lte = parseFloat(maxPrice);
    }
    if (isOrganic === 'true') query.isOrganic = true;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { variety: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const crops = await Crop.find(query)
      .populate('farmer', 'name phone address')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Crop.countDocuments(query);

    res.json({
      success: true,
      data: {
        crops,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get marketplace crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/crops/:id
// @desc    Get single crop details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name phone address')
      .populate('inquiries.buyer', 'name phone');

    if (!crop || !crop.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Increment views (simplified - always increment)
    await crop.incrementViews();

    res.json({
      success: true,
      data: { crop }
    });

  } catch (error) {
    console.error('Get crop details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/v1/crops/:id
// @access  Public (simplified auth)
router.delete('/:id', async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      message: 'This endpoint requires authentication. Feature not available in simplified mode.'
    });
  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete crop',
      error: error.message
    });
  }
});

// @desc    Get farmer's crops (legacy route)
// @route   GET /api/v1/crops/farmer/my-crops
// @access  Public (simplified auth)
router.get('/farmer/my-crops', async (req, res) => {
  try {
    res.status(400).json({
      success: false,
      message: 'This endpoint is deprecated. Use /api/v1/crops/farmer/:email instead'
    });
  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farmer crops',
      error: error.message
    });
  }
});

// @desc    Create new crop (simplified auth)
// @route   POST /api/v1/crops/upload
// @access  Public (simplified auth)
router.post('/upload', async (req, res) => {
  try {
    const { name, quantity, unit, pricePerUnit, farmerEmail } = req.body;

    // Basic validation
    if (!name || !quantity || !farmerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name, quantity, and farmer email are required'
      });
    }

    // Find farmer by email
    const farmer = await User.findOne({ email: farmerEmail });
    if (!farmer || farmer.role !== 'farmer') {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Create crop data
    const cropData = {
      name,
      variety: name, // Use name as variety for simplicity
      category: getCategoryFromName(name),
      quantity: parseFloat(quantity),
      unit: unit || 'kg',
      pricePerUnit: parseFloat(pricePerUnit) || 0,
      farmer: farmer._id,
      harvestDate: new Date(),
      status: 'listed',
      farmLocation: farmer.address || {},
      images: [] // Will be populated when image upload is implemented
    };

    const crop = await Crop.create(cropData);
    
    // Populate farmer details
    await crop.populate('farmer', 'name email phone address');

    res.status(201).json({
      success: true,
      message: 'Crop uploaded successfully',
      crop
    });

  } catch (error) {
    console.error('Upload crop error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload crop',
      error: error.message
    });
  }
});

// @desc    Get crops by farmer email
// @route   GET /api/v1/crops/farmer/:email
// @access  Public (simplified auth)
router.get('/farmer/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    // Find farmer by email
    const farmer = await User.findOne({ email });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    // Build query
    const query = { farmer: farmer._id, isActive: true };
    if (status && status !== 'all') {
      query.status = status;
    }

    // Get crops with pagination
    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('farmer', 'name email phone address');

    const total = await Crop.countDocuments(query);

    // Calculate additional stats
    const totalOrders = 0; // Will be calculated from orders when implemented
    const totalRevenue = crops
      .filter(crop => crop.status === 'sold')
      .reduce((sum, crop) => sum + (crop.quantity * crop.pricePerUnit), 0);

    res.json({
      success: true,
      data: {
        crops,
        stats: {
          totalCrops: total,
          totalOrders,
          totalRevenue,
          activeCrops: crops.filter(crop => crop.status === 'listed').length
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get farmer crops',
      error: error.message
    });
  }
});

// Helper function to determine category from crop name
function getCategoryFromName(name) {
  const lowerName = name.toLowerCase();
  
  if (['rice', 'wheat', 'maize', 'corn', 'barley', 'oats'].includes(lowerName)) {
    return 'grains';
  } else if (['tomato', 'potato', 'onion', 'carrot', 'cabbage', 'spinach'].includes(lowerName)) {
    return 'vegetables';
  } else if (['apple', 'banana', 'orange', 'mango', 'grapes'].includes(lowerName)) {
    return 'fruits';
  } else if (['groundnut', 'peanut', 'lentil', 'chickpea', 'bean'].includes(lowerName)) {
    return 'pulses';
  } else if (['turmeric', 'chili', 'pepper', 'coriander', 'cumin'].includes(lowerName)) {
    return 'spices';
  } else if (['sugarcane', 'cotton', 'tobacco'].includes(lowerName)) {
    return 'cash_crops';
  }
  
  return 'grains'; // Default category
}

module.exports = router;
