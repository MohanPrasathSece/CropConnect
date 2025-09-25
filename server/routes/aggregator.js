const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const sharp = require('sharp');
const mongoose = require('mongoose');
const AggregatorCollection = require('../models/AggregatorCollection');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { ethers } = require('ethers');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/aggregator/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'quality-check-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// AI Quality Detection Simulation (replace with actual TensorFlow.js/OpenCV implementation)
const performAIQualityCheck = async (imagePaths) => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock AI analysis results
  const analysis = {
    overallGrade: ['Premium', 'A', 'B', 'C'][Math.floor(Math.random() * 4)],
    qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
    aiAnalysis: {
      visualInspection: {
        color: ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)],
        texture: ['Uniform', 'Slightly Varied', 'Inconsistent'][Math.floor(Math.random() * 3)],
        size: ['Uniform', 'Mixed', 'Small'][Math.floor(Math.random() * 3)],
        uniformity: Math.floor(Math.random() * 30) + 70
      },
      defectDetection: Math.random() > 0.7 ? [{
        defectType: ['Insect Damage', 'Discoloration', 'Cracks', 'Foreign Matter'][Math.floor(Math.random() * 4)],
        severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        affectedPercentage: Math.floor(Math.random() * 15) + 1
      }] : [],
      moistureContent: Math.floor(Math.random() * 10) + 10, // 10-20%
      purityLevel: Math.floor(Math.random() * 20) + 80, // 80-100%
      contaminants: Math.random() > 0.8 ? ['Dust', 'Stones'] : [],
      pesticidesDetected: Math.random() > 0.9,
      organicCompliance: Math.random() > 0.3
    },
    inspectionImages: imagePaths.map(path => ({
      url: path,
      type: 'original',
      timestamp: new Date()
    })),
    analyzedAt: new Date()
  };
  
  return analysis;
};

// Blockchain integration function
const storeOnBlockchain = async (collectionData) => {
  try {
    // Mock blockchain transaction (replace with actual smart contract interaction)
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    const mockBlockNumber = Math.floor(Math.random() * 1000000) + 1000000;
    
    return {
      transactionHash: mockTxHash,
      blockNumber: mockBlockNumber,
      contractAddress: process.env.PRODUCE_LEDGER_ADDRESS || '0x1234567890123456789012345678901234567890',
      produceId: Math.floor(Math.random() * 10000) + 1000,
      gasUsed: Math.floor(Math.random() * 100000) + 50000,
      confirmations: 1,
      isConfirmed: true,
      blockchainTimestamp: new Date()
    };
  } catch (error) {
    console.error('Blockchain storage error:', error);
    return null;
  }
};

// @route   POST /api/v1/aggregator/scan-qr
// @desc    Scan farmer's QR code to get crop details
// @access  Private (Aggregator only)
router.post('/scan-qr', protect, authorize('aggregator'), [
  body('qrCode').notEmpty().withMessage('QR code is required'),
  body('scannedLocation.latitude').optional().isNumeric(),
  body('scannedLocation.longitude').optional().isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const aggregator = await User.findById(req.user.id);
    if (!aggregator || aggregator.role !== 'aggregator') {
      return res.status(403).json({
        success: false,
        message: 'Only aggregators can scan QR codes'
      });
    }

    const { qrCode, scannedLocation } = req.body;

    // Parse QR code to extract crop information
    let qrData;
    try {
      qrData = JSON.parse(qrCode);
    } catch (error) {
      // If QR code is just a traceability ID
      const crop = await Crop.findOne({ traceabilityId: qrCode })
        .populate('farmer', 'name phone address');
      
      if (!crop) {
        return res.status(404).json({
          success: false,
          message: 'Invalid QR code or crop not found'
        });
      }

      qrData = {
        cropId: crop._id,
        traceabilityId: crop.traceabilityId,
        farmer: crop.farmer.name,
        cropName: crop.name,
        variety: crop.variety,
        harvestDate: crop.harvestDate,
        quantity: crop.quantity,
        unit: crop.unit
      };
    }

    // Get full crop details
    const crop = await Crop.findById(qrData.cropId)
      .populate('farmer', 'name phone address farmLocation');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Check if crop is available for collection
    if (crop.status !== 'listed') {
      return res.status(400).json({
        success: false,
        message: 'Crop is not available for collection'
      });
    }

    res.json({
      success: true,
      message: 'QR code scanned successfully',
      data: {
        crop: {
          id: crop._id,
          name: crop.name,
          variety: crop.variety,
          category: crop.category,
          quantity: crop.quantity,
          unit: crop.unit,
          pricePerUnit: crop.pricePerUnit,
          harvestDate: crop.harvestDate,
          farmLocation: crop.farmLocation,
          quality: crop.quality,
          isOrganic: crop.isOrganic,
          certifications: crop.certifications,
          images: crop.images,
          traceabilityId: crop.traceabilityId
        },
        farmer: {
          id: crop.farmer._id,
          name: crop.farmer.name,
          phone: crop.farmer.phone,
          address: crop.farmer.address,
          farmLocation: crop.farmer.farmLocation
        },
        scannedAt: new Date(),
        scannedLocation
      }
    });

  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scanning QR code'
    });
  }
});

// @route   POST /api/v1/aggregator/collect-crop
// @desc    Collect crop from farmer with AI quality check
// @access  Private (Aggregator only)
router.post('/collect-crop', protect, authorize('aggregator'), upload.array('qualityImages', 10), [
  body('cropId').isMongoId().withMessage('Valid crop ID is required'),
  body('collectedQuantity').isNumeric().isFloat({ min: 0 }).withMessage('Collected quantity must be positive'),
  body('collectedUnit').isIn(['kg', 'tons', 'bags', 'quintal']).withMessage('Invalid unit'),
  body('purchasePrice').isNumeric().isFloat({ min: 0 }).withMessage('Purchase price must be positive'),
  body('collectionLocation.farmAddress').notEmpty().withMessage('Farm address is required'),
  body('collectionLocation.district').notEmpty().withMessage('District is required'),
  body('collectionLocation.state').notEmpty().withMessage('State is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const aggregator = await User.findById(req.user.id);
    if (!aggregator || aggregator.role !== 'aggregator') {
      return res.status(403).json({
        success: false,
        message: 'Only aggregators can collect crops'
      });
    }

    const {
      cropId,
      collectedQuantity,
      collectedUnit,
      purchasePrice,
      collectionLocation,
      storageDetails,
      notes
    } = req.body;

    // Get crop details
    const crop = await Crop.findById(cropId).populate('farmer');
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Process uploaded images for quality check
    const imagePaths = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Compress and process image
        const processedPath = file.path.replace(path.extname(file.path), '_processed' + path.extname(file.path));
        await sharp(file.path)
          .resize(1024, 768, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(processedPath);

        imagePaths.push(`/uploads/aggregator/${path.basename(processedPath)}`);
      }
    }

    // Perform AI Quality Check
    console.log('🤖 Starting AI quality analysis...');
    const qualityAssessment = await performAIQualityCheck(imagePaths);
    console.log('✅ AI quality analysis completed');

    // Generate new QR code for aggregated batch
    const batchData = {
      collectionId: `AGG-${Date.now()}`,
      originalCrop: cropId,
      aggregator: aggregator.name,
      collectionDate: new Date(),
      qualityGrade: qualityAssessment.overallGrade,
      batchQuantity: collectedQuantity,
      traceabilityChain: [crop.traceabilityId]
    };

    const aggregatorQRCode = await QRCode.toDataURL(JSON.stringify(batchData));

    // Create aggregator collection record
    const collection = new AggregatorCollection({
      aggregator: req.user.id,
      sourceCrop: cropId,
      farmer: crop.farmer._id,
      collectedQuantity: parseFloat(collectedQuantity),
      collectedUnit,
      collectionDate: new Date(),
      collectionLocation: JSON.parse(collectionLocation || '{}'),
      qualityAssessment,
      traceability: {
        originalQRCode: crop.qrCode?.code || crop.traceabilityId,
        aggregatorQRCode,
        traceabilityChain: [{
          stage: 'collection',
          actor: aggregator.name,
          timestamp: new Date(),
          location: JSON.parse(collectionLocation || '{}').district,
          action: 'Crop collected from farmer',
          notes: notes || ''
        }]
      },
      marketInfo: {
        purchasePrice: parseFloat(purchasePrice),
        pricePerUnit: parseFloat(purchasePrice) / parseFloat(collectedQuantity),
        totalValue: parseFloat(purchasePrice) * parseFloat(collectedQuantity)
      },
      storage: JSON.parse(storageDetails || '{}'),
      status: 'collected',
      notes
    });

    await collection.save();

    // Store on blockchain
    console.log('⛓️ Storing collection data on blockchain...');
    const blockchainData = await storeOnBlockchain({
      collectionId: collection.collectionId,
      cropId,
      aggregatorId: req.user.id,
      qualityGrade: qualityAssessment.overallGrade,
      quantity: collectedQuantity,
      timestamp: new Date()
    });

    if (blockchainData) {
      collection.blockchain = blockchainData;
      await collection.save();
      console.log('✅ Data stored on blockchain successfully');
    }

    // Update original crop status
    crop.status = 'sold';
    crop.availability = 'sold_out';
    await crop.save();

    // Add traceability entry
    await collection.addTraceabilityEntry(
      'quality_checked',
      'AI quality analysis completed',
      `Quality Grade: ${qualityAssessment.overallGrade}, Score: ${qualityAssessment.qualityScore}/100`
    );

    await collection.populate([
      { path: 'sourceCrop', select: 'name variety category' },
      { path: 'farmer', select: 'name phone address' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Crop collected and quality checked successfully',
      data: {
        collection,
        qualityReport: {
          grade: qualityAssessment.overallGrade,
          score: qualityAssessment.qualityScore,
          aiAnalysis: qualityAssessment.aiAnalysis,
          defects: qualityAssessment.aiAnalysis.defectDetection,
          compliance: {
            organic: qualityAssessment.aiAnalysis.organicCompliance,
            pesticides: !qualityAssessment.aiAnalysis.pesticidesDetected,
            purity: qualityAssessment.aiAnalysis.purityLevel
          }
        },
        blockchain: blockchainData,
        newQRCode: aggregatorQRCode
      }
    });

  } catch (error) {
    console.error('Crop collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while collecting crop'
    });
  }
});

// @route   GET /api/v1/aggregator/collections
// @desc    Get all collections by aggregator
// @access  Private (Aggregator only)
router.get('/collections', protect, authorize('aggregator'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sortBy = 'collectionDate', sortOrder = 'desc' } = req.query;

    const aggregator = await User.findById(req.user.id);
    if (!aggregator || aggregator.role !== 'aggregator') {
      return res.status(403).json({
        success: false,
        message: 'Only aggregators can access collections'
      });
    }

    const query = { aggregator: req.user.id, isActive: true };
    if (status) query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const collections = await AggregatorCollection.find(query)
      .populate('sourceCrop', 'name variety category images')
      .populate('farmer', 'name phone address')
      .populate('buyer.buyerId', 'name phone')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await AggregatorCollection.countDocuments(query);

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/aggregator/collections/:id
// @desc    Get single collection with full traceability
// @access  Private (Aggregator only)
router.get('/collections/:id', protect, authorize('aggregator'), async (req, res) => {
  try {
    const collection = await AggregatorCollection.findById(req.params.id)
      .populate('sourceCrop')
      .populate('farmer', 'name phone address farmLocation')
      .populate('buyer.buyerId', 'name phone address')
      .populate('aggregator', 'name phone address');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (collection.aggregator._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this collection'
      });
    }

    res.json({
      success: true,
      data: { collection }
    });

  } catch (error) {
    console.error('Get collection details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/v1/aggregator/collections/:id/status
// @desc    Update collection status
// @access  Private (Aggregator only)
router.put('/collections/:id/status', protect, authorize('aggregator'), [
  body('status').isIn([
    'collected', 'quality_checked', 'stored', 'processed', 
    'ready_for_sale', 'sold', 'in_transit', 'delivered', 'rejected'
  ]).withMessage('Invalid status'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const collection = await AggregatorCollection.findById(req.params.id);
    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    if (collection.aggregator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this collection'
      });
    }

    const { status, notes } = req.body;
    await collection.updateStatus(status, notes);

    res.json({
      success: true,
      message: 'Collection status updated successfully',
      data: { collection }
    });

  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/aggregator/analytics
// @desc    Get aggregator analytics and dashboard data
// @access  Private (Aggregator only)
router.get('/analytics', protect, authorize('aggregator'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateRange = {};
    if (startDate) dateRange.start = startDate;
    if (endDate) dateRange.end = endDate;

    const analytics = await AggregatorCollection.getAnalytics(req.user.id, dateRange);
    
    // Get recent collections
    const recentCollections = await AggregatorCollection.find({
      aggregator: req.user.id,
      isActive: true
    })
    .populate('sourceCrop', 'name variety')
    .populate('farmer', 'name')
    .sort({ collectionDate: -1 })
    .limit(5);

    // Get quality distribution
    const qualityDistribution = await AggregatorCollection.aggregate([
      { $match: { aggregator: mongoose.Types.ObjectId(req.user.id), isActive: true } },
      {
        $group: {
          _id: '$qualityAssessment.overallGrade',
          count: { $sum: 1 },
          avgScore: { $avg: '$qualityAssessment.qualityScore' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        analytics: analytics[0] || {},
        recentCollections,
        qualityDistribution
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/v1/aggregator/trace/:traceabilityId
// @desc    Get complete traceability chain for a product
// @access  Public
router.get('/trace/:traceabilityId', async (req, res) => {
  try {
    const { traceabilityId } = req.params;

    // Find collection by traceability ID or batch number
    const collection = await AggregatorCollection.findOne({
      $or: [
        { 'traceability.originalQRCode': traceabilityId },
        { 'traceability.batchNumber': traceabilityId },
        { collectionId: traceabilityId }
      ]
    })
    .populate('sourceCrop', 'name variety harvestDate farmLocation')
    .populate('farmer', 'name address')
    .populate('aggregator', 'name address')
    .populate('buyer.buyerId', 'name address');

    if (!collection) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in traceability system'
      });
    }

    // Build complete traceability chain
    const traceabilityChain = [
      {
        stage: 'Farm Production',
        actor: collection.farmer.name,
        location: collection.sourceCrop.farmLocation,
        timestamp: collection.sourceCrop.harvestDate,
        details: {
          cropName: collection.sourceCrop.name,
          variety: collection.sourceCrop.variety,
          harvestDate: collection.sourceCrop.harvestDate
        }
      },
      {
        stage: 'Collection & Quality Check',
        actor: collection.aggregator.name,
        location: collection.collectionLocation,
        timestamp: collection.collectionDate,
        details: {
          qualityGrade: collection.qualityAssessment.overallGrade,
          qualityScore: collection.qualityAssessment.qualityScore,
          collectedQuantity: collection.collectedQuantity,
          aiAnalysis: collection.qualityAssessment.aiAnalysis
        }
      },
      ...collection.traceability.traceabilityChain
    ];

    if (collection.buyer.buyerId) {
      traceabilityChain.push({
        stage: 'Sale',
        actor: collection.buyer.buyerId.name,
        location: collection.buyer.buyerId.address,
        timestamp: collection.buyer.saleDate,
        details: {
          salePrice: collection.buyer.salePrice,
          paymentStatus: collection.buyer.paymentStatus
        }
      });
    }

    res.json({
      success: true,
      data: {
        productInfo: {
          collectionId: collection.collectionId,
          batchNumber: collection.traceability.batchNumber,
          cropName: collection.sourceCrop.name,
          variety: collection.sourceCrop.variety,
          currentStatus: collection.status,
          qualityGrade: collection.qualityAssessment.overallGrade
        },
        traceabilityChain,
        blockchain: collection.blockchain,
        qualityReport: collection.qualityAssessment
      }
    });

  } catch (error) {
    console.error('Traceability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
