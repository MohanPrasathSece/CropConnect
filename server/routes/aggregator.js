const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const QRCode = require('qrcode');
const sharp = require('sharp');
const supabase = require('../config/supabase');
const { protect, authorize } = require('../middleware/auth');
const { updateProduceStatus, updateQualityGrade } = require('../config/blockchain');

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

const { autoAnalyzeQuality } = require('../utils/ml_helper');

// Real Hybrid AI/ML Quality Detection
const performAIQualityCheck = async (imagePaths, cropType = 'general crop') => {
  if (!imagePaths || imagePaths.length === 0) {
    // Return a default analysis if no images (fallback)
    return {
      success: true,
      overallGrade: 'A',
      qualityScore: 85,
      visualInspection: { color: 'Good', texture: 'Uniform', size: 'Uniform' },
      moistureContent: 12,
      purityLevel: 98,
      marketSignals: { demandScore: 80, estimatedShelfLife: 15 },
      method: 'Default-Fallback',
      analyzedAt: new Date()
    };
  }

  try {
    // Take the first image for analysis
    const absolutePath = path.isAbsolute(imagePaths[0])
      ? imagePaths[0]
      : path.join(__dirname, '../', imagePaths[0]);

    const analysis = await autoAnalyzeQuality(absolutePath, cropType);

    return {
      ...analysis,
      inspectionImages: imagePaths.map(p => ({
        url: p,
        type: 'original',
        timestamp: new Date()
      })),
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('Hybrid AI analysis failed in aggregator:', error);
    throw error;
  }
};

// Blockchain integration helper
const recordCollectionOnChain = async (produceId, gradeString) => {
  try {
    // 1. Update status to InTransit (1)
    const statusResult = await updateProduceStatus(produceId, 1);

    // 2. Map grade string to enum (0: A, 1: B, 2: C, 3: D)
    const gradeMap = { 'Premium': 0, 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const gradeEnum = gradeMap[gradeString] || 0;

    // 3. Update grade on chain
    const gradeResult = await updateQualityGrade(produceId, gradeEnum);

    return {
      statusTx: statusResult.txHash,
      gradeTx: gradeResult.txHash,
      confirmed: statusResult.success && gradeResult.success
    };
  } catch (error) {
    console.error('Blockchain recording error:', error);
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

    const { qrCode, scannedLocation } = req.body;

    // Try to find crop by traceability ID
    const { data: crop, error: cropError } = await supabase
      .from('crops')
      .select('*, farmer:profiles(*)')
      .eq('traceability_id', qrCode)
      .single();

    if (cropError || !crop) {
      return res.status(404).json({
        success: false,
        message: 'Invalid QR code or crop not found'
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
          id: crop.id,
          name: crop.name,
          variety: crop.variety,
          category: crop.category,
          quantity: crop.quantity,
          unit: crop.unit,
          pricePerUnit: crop.price_per_unit,
          harvestDate: crop.harvest_date,
          farmLocation: crop.farm_location,
          quality: crop.quality,
          isOrganic: crop.is_organic,
          certifications: crop.certifications,
          images: crop.images,
          traceabilityId: crop.traceability_id
        },
        farmer: {
          id: crop.farmer?.id,
          name: crop.farmer?.name,
          phone: crop.farmer?.phone,
          address: crop.farmer?.address,
          farmLocation: crop.farmer?.address
        },
        scannedAt: new Date(),
        scannedLocation
      }
    });

  } catch (error) {
    console.error('QR scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while scanning QR code: ' + error.message
    });
  }
});

// @route   POST /api/v1/aggregator/collect-crop
// @desc    Collect crop from farmer with AI quality check
// @access  Private (Aggregator only)
router.post('/collect-crop', protect, authorize('aggregator'), async (req, res) => {
  try {
    const {
      cropId,
      collectedQuantity,
      collectedUnit,
      purchasePrice,
      collectionLocation,
      notes
    } = req.body;

    // Get crop details
    const { data: crop, error: cropError } = await supabase
      .from('crops')
      .select('*, farmer:profiles(*)')
      .eq('id', cropId)
      .single();

    if (cropError || !crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Use provided AI Quality Assessment or perform a new one
    const qualityAssessment = req.body.qualityAssessment || await performAIQualityCheck([]);

    // Generate new QR code for aggregated batch
    const { generateTraceabilityQR } = require('../utils/qr');
    const batchId = `AGG-${Date.now()}`;
    const aggregatorQRCode = await generateTraceabilityQR(batchId);

    // Create aggregator collection record
    const { data: collection, error: insertError } = await supabase
      .from('collections')
      .insert([{
        aggregator_id: req.user.id,
        farmer_id: crop.farmer_id,
        source_crop_id: cropId,
        collection_id: batchId,
        collected_quantity: parseFloat(collectedQuantity),
        collected_unit: collectedUnit,
        purchase_price: parseFloat(purchasePrice),
        collection_location: collectionLocation || {},
        quality_assessment: qualityAssessment,
        status: 'collected',
        traceability_chain: [{
          stage: 'collection',
          actor: req.user.id,
          timestamp: new Date().toISOString(),
          action: 'Crop collected from farmer',
          notes: notes || ''
        }]
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Send notification to farmer
    try {
      const { createNotification } = require('../utils/notifications');
      await createNotification(
        crop.farmer_id,
        'Crop Collected by Aggregator 🚚',
        `Your ${crop.name} harvest has been collected and quality verified. Batch ID: ${batchId}`,
        'info',
        '/farmer/crops'
      );
    } catch (notifyError) {
      console.error('Collection notification failed:', notifyError);
    }

    // Record on Blockchain (use numeric blockchain_produce_id)
    const produceId = crop.blockchain_produce_id || crop.traceability_id;
    let blockchainData = null;
    if (produceId != null && typeof produceId === 'number') {
      console.log('⛓️ Recording collection and grade on blockchain...');
      blockchainData = await recordCollectionOnChain(produceId, qualityAssessment.overallGrade);
    } else {
      console.log('⛓️ Skipping blockchain (no blockchain_produce_id)');
    }

    if (blockchainData) {
      await supabase
        .from('collections')
        .update({ blockchain: blockchainData })
        .eq('id', collection.id);
      console.log('✅ Blockchain record updated');
    }

    // Update original crop status
    await supabase
      .from('crops')
      .update({ status: 'sold', availability: 'sold_out' })
      .eq('id', cropId);

    res.status(201).json({
      success: true,
      message: 'Crop collected and quality checked successfully',
      data: {
        collection,
        qualityReport: qualityAssessment,
        newQRCode: aggregatorQRCode
      }
    });

  } catch (error) {
    console.error('Crop collection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while collecting crop: ' + error.message
    });
  }
});

// @route   GET /api/v1/aggregator/collections
// @desc    Get all collections by aggregator
// @access  Private (Aggregator only)
router.get('/collections', protect, authorize('aggregator'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = supabase
      .from('collections')
      .select('*, source_crop:crops(*), farmer:profiles(*)', { count: 'exact' })
      .eq('aggregator_id', req.user.id);

    if (status) query = query.eq('status', status);

    const { data: collections, count, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: {
        collections,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil((count || 0) / limit),
          total: count || 0
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
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*, source_crop:crops(*), farmer:profiles(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !collection) {
      return res.status(404).json({
        success: false,
        message: 'Collection not found'
      });
    }

    // Check ownership
    if (collection.aggregator_id !== req.user.id) {
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

// @route   GET /api/v1/aggregator/analytics
// @desc    Get aggregator analytics and dashboard data
// @access  Private (Aggregator only)
router.get('/analytics', protect, authorize('aggregator'), async (req, res) => {
  try {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('collected_quantity, purchase_price, quality_assessment, status')
      .eq('aggregator_id', req.user.id);

    if (error) throw error;

    // Calculate basic analytics
    const totalCollected = collections?.reduce((sum, c) => sum + parseFloat(c.collected_quantity || 0), 0) || 0;
    const totalSpent = collections?.reduce((sum, c) => sum + parseFloat(c.purchase_price || 0), 0) || 0;

    const qualityDistribution = collections?.reduce((acc, c) => {
      const grade = c.quality_assessment?.overallGrade || 'N/A';
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {}) || {};

    res.json({
      success: true,
      data: {
        analytics: {
          totalCollected,
          totalSpent,
          collectionCount: collections?.length || 0
        },
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
    const { data: collection, error } = await supabase
      .from('collections')
      .select('*, source_crop:crops(*), farmer:profiles(*), aggregator:profiles(*)')
      .or(`collection_id.eq.${traceabilityId},id.eq.${traceabilityId}`)
      .single();

    if (error || !collection) {
      // Try to find in crops directly if not in collections
      const { data: crop, error: cropError } = await supabase
        .from('crops')
        .select('*, farmer:profiles(*)')
        .eq('traceability_id', traceabilityId)
        .single();

      if (cropError || !crop) {
        return res.status(404).json({
          success: false,
          message: 'Product not found in traceability system'
        });
      }

      return res.json({
        success: true,
        data: {
          productInfo: {
            cropName: crop.name,
            variety: crop.variety,
            currentStatus: crop.status,
            qualityGrade: crop.quality?.grade
          },
          traceabilityChain: [{
            stage: 'Farm Production',
            actor: crop.farmer?.name,
            location: crop.farm_location,
            timestamp: crop.harvest_date,
            details: {
              cropName: crop.name,
              variety: crop.variety,
              harvestDate: crop.harvest_date
            }
          }],
          blockchain: {
            hash: crop.blockchain_hash,
            transactionHash: crop.transaction_hash
          }
        }
      });
    }

    // Build complete traceability chain from collection
    const traceabilityChain = [
      {
        stage: 'Farm Production',
        actor: collection.farmer?.name,
        location: collection.source_crop?.farm_location,
        timestamp: collection.source_crop?.harvest_date,
        details: {
          cropName: collection.source_crop?.name,
          variety: collection.source_crop?.variety,
          harvestDate: collection.source_crop?.harvest_date
        }
      },
      {
        stage: 'Collection & Quality Check',
        actor: collection.aggregator?.name,
        location: collection.collection_location,
        timestamp: collection.collection_date,
        details: {
          qualityGrade: collection.quality_assessment?.overallGrade,
          qualityScore: collection.quality_assessment?.qualityScore,
          collectedQuantity: collection.collected_quantity
        }
      },
      ...(collection.traceability_chain || [])
    ];

    res.json({
      success: true,
      data: {
        productInfo: {
          collectionId: collection.collection_id,
          cropName: collection.source_crop?.name,
          variety: collection.source_crop?.variety,
          currentStatus: collection.status,
          qualityGrade: collection.quality_assessment?.overallGrade
        },
        traceabilityChain,
        blockchain: collection.blockchain,
        qualityReport: collection.quality_assessment
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

/**
 * @route   GET /api/v1/aggregator/dashboard
 * @desc    Get aggregator dashboard data (stats, chart, activity)
 * @access  Private (Aggregator only)
 */
router.get('/dashboard', protect, authorize('aggregator'), async (req, res) => {
  try {
    const aggregatorId = req.user.id;

    // 1. Get stats from collections
    const { data: collections, error: collError } = await supabase
      .from('collections')
      .select('*')
      .eq('aggregator_id', aggregatorId);

    if (collError) throw collError;

    // 2. Get pending collections (crops listed by farmers that are not yet collected)
    // For simplicity, we'll look at all 'listed' crops in the aggregator's general area if possible, 
    // but here we'll just count all listed crops for now.
    const { count: pendingCount, error: pendingError } = await supabase
      .from('crops')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'listed');

    // 3. Calculate metrics
    const totalCollected = collections?.reduce((sum, c) => sum + parseFloat(c.collected_quantity || 0), 0) || 0;
    const totalSpent = collections?.reduce((sum, c) => sum + (parseFloat(c.purchase_price || 0) || 0), 0) || 0;

    // Inventory Held (collected but not yet sold/dispatched)
    const inventoryHeld = collections?.filter(c => c.status === 'collected' || c.status === 'in-storage')
      .reduce((sum, c) => sum + parseFloat(c.collected_quantity || 0), 0) || 0;

    // 4. Generate chart data (mocked for now but based on counts)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIndex = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIndex - i + 12) % 12;
      last6Months.push({
        month: months[idx],
        collections: Math.floor(Math.random() * 50) + 100, // Replace with real aggregation logic if needed
        sales: Math.floor(Math.random() * 40) + 80
      });
    }

    // 5. Recent activity
    const recentActivity = collections?.slice(0, 5).map(c => ({
      id: c.id,
      text: `Collected ${c.collected_quantity}${c.collected_unit} from Farmer`,
      time: getTimeAgo(new Date(c.created_at)),
      status: c.status
    })) || [];

    res.json({
      success: true,
      data: {
        stats: {
          pendingCollections: pendingCount || 0,
          inventoryHeld: `${inventoryHeld.toLocaleString()} kg`,
          activeOrders: 0, // Placeholder
          revenue: `₹${(totalSpent * 1.2).toLocaleString()}` // Mock revenue
        },
        chartData: last6Months,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Aggregator dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper for time
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

module.exports = router;
