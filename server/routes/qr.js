const express = require('express');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const Crop = require('../models/Crop');
const AggregatorCollection = require('../models/AggregatorCollection');

const router = express.Router();

// @desc    Generate QR code for crop and persist image + metadata
// @route   GET /api/v1/qr/generate/:cropId
// @access  Public (idempotent)
router.get('/generate/:cropId', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.cropId)
      .populate('farmer', 'name phone address');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'qr');
    fs.mkdirSync(uploadsDir, { recursive: true });

    // Build QR payload: prefer traceabilityId for stability
    const payload = {
      traceabilityId: crop.traceabilityId,
      cropId: String(crop._id),
      type: 'crop',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/trace/${crop.traceabilityId}`
    };

    const fileName = `crop-${crop.traceabilityId}.png`;
    const filePath = path.join(uploadsDir, fileName);

    // Generate and write QR PNG
    await QRCode.toFile(filePath, JSON.stringify(payload), {
      width: 512,
      margin: 2
    });

    // Update crop document with QR metadata (idempotent)
    crop.qrCode = {
      code: payload.traceabilityId,
      imageUrl: `/uploads/qr/${fileName}`,
      generatedAt: new Date()
    };
    await crop.save();

    res.json({
      success: true,
      message: 'QR code generated',
      qr: {
        imageUrl: crop.qrCode.imageUrl,
        code: crop.qrCode.code,
        payload
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

// @desc    Verify QR code payload or code value quickly
// @route   GET /api/v1/qr/verify/:code
// @access  Public
router.get('/verify/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const crop = await Crop.findOne({ $or: [{ traceabilityId: code }, { _id: code }] })
      .populate('farmer', 'name phone address farmerDetails');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'QR not found' });
    }

    res.json({
      success: true,
      data: {
        crop: {
          id: crop._id,
          traceabilityId: crop.traceabilityId,
          name: crop.name,
          variety: crop.variety,
          farmer: crop.farmer,
          status: crop.status,
          qrCode: crop.qrCode
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR',
      error: error.message
    });
  }
});

// @desc    Get complete traceability chain for a traceabilityId
// @route   GET /api/v1/qr/trace/:traceabilityId
// @access  Public
router.get('/trace/:traceabilityId', async (req, res) => {
  try {
    const { traceabilityId } = req.params;

    // Find crop by traceabilityId (or fallback by id)
    const crop = await Crop.findOne({ $or: [{ traceabilityId }, { _id: traceabilityId }] })
      .populate('farmer', 'name address phone farmLocation');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Find all aggregator collections linked to this crop
    const collections = await AggregatorCollection.find({ sourceCrop: crop._id, isActive: true })
      .populate('aggregator', 'name address')
      .populate('buyer.buyerId', 'name address');

    // Build traceability chain
    const chain = [];

    // Stage 1: Farm Production
    chain.push({
      stage: 'Farm Production',
      actor: crop.farmer?.name,
      location: crop.farmLocation,
      timestamp: crop.harvestDate,
      details: {
        cropName: crop.name,
        variety: crop.variety,
        category: crop.category,
        quality: crop.quality,
        isOrganic: crop.isOrganic
      }
    });

    // Subsequent stages from each collection (ordered by date)
    const sortedCollections = collections.sort((a, b) => new Date(a.collectionDate) - new Date(b.collectionDate));

    for (const col of sortedCollections) {
      chain.push({
        stage: 'Collection & Quality Check',
        actor: col.aggregator?.name,
        location: col.collectionLocation,
        timestamp: col.collectionDate,
        details: {
          qualityGrade: col.qualityAssessment?.overallGrade,
          qualityScore: col.qualityAssessment?.qualityScore,
          collectedQuantity: col.collectedQuantity,
          aiAnalysis: col.qualityAssessment?.aiAnalysis
        }
      });

      // Append internal traceability chain entries
      if (Array.isArray(col.traceability?.traceabilityChain)) {
        for (const entry of col.traceability.traceabilityChain) {
          chain.push({
            stage: entry.stage,
            actor: entry.actor,
            location: entry.location,
            timestamp: entry.timestamp,
            details: { action: entry.action, notes: entry.notes }
          });
        }
      }

      // Add sale stage if sold
      if (col.buyer?.buyerId) {
        chain.push({
          stage: 'Sale',
          actor: col.buyer.buyerId.name,
          location: col.buyer.buyerId.address,
          timestamp: col.buyer.saleDate,
          details: {
            salePrice: col.buyer.salePrice,
            paymentStatus: col.buyer.paymentStatus
          }
        });
      }
    }

    res.json({
      success: true,
      data: {
        product: {
          cropId: crop._id,
          traceabilityId: crop.traceabilityId,
          name: crop.name,
          variety: crop.variety,
          category: crop.category,
          status: crop.status,
          qrCode: crop.qrCode
        },
        chain,
        collections: sortedCollections
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch traceability chain',
      error: error.message
    });
  }
});

module.exports = router;
