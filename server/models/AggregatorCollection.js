const mongoose = require('mongoose');

const aggregatorCollectionSchema = new mongoose.Schema({
  // Basic Collection Information
  collectionId: {
    type: String,
    unique: true,
    required: true
  },
  aggregator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Source Crop Information
  sourceCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Collection Details
  collectedQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  collectedUnit: {
    type: String,
    enum: ['kg', 'tons', 'bags', 'quintal'],
    default: 'kg'
  },
  collectionDate: {
    type: Date,
    default: Date.now
  },
  collectionLocation: {
    farmAddress: String,
    gpsCoordinates: {
      latitude: Number,
      longitude: Number
    },
    district: String,
    state: String
  },
  
  // AI Quality Detection Results
  qualityAssessment: {
    overallGrade: {
      type: String,
      enum: ['Premium', 'A', 'B', 'C', 'Rejected'],
      required: true
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100
    },
    aiAnalysis: {
      visualInspection: {
        color: String,
        texture: String,
        size: String,
        uniformity: Number
      },
      defectDetection: [{
        defectType: String,
        severity: {
          type: String,
          enum: ['Low', 'Medium', 'High']
        },
        affectedPercentage: Number
      }],
      moistureContent: Number,
      purityLevel: Number,
      contaminants: [String],
      pesticidesDetected: Boolean,
      organicCompliance: Boolean
    },
    inspectionImages: [{
      url: String,
      type: String, // 'original', 'processed', 'defect_highlighted'
      timestamp: Date
    }],
    inspectorNotes: String,
    analyzedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  // Traceability Information
  traceability: {
    originalQRCode: String, // From farmer's crop
    aggregatorQRCode: String, // New QR for aggregated batch
    batchNumber: String,
    traceabilityChain: [{
      stage: String,
      actor: String,
      timestamp: Date,
      location: String,
      action: String,
      notes: String
    }]
  },
  
  // Blockchain Integration
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    contractAddress: String,
    produceId: Number, // From smart contract
    gasUsed: Number,
    confirmations: Number,
    isConfirmed: {
      type: Boolean,
      default: false
    },
    blockchainTimestamp: Date
  },
  
  // Storage and Processing
  storage: {
    facilityName: String,
    facilityAddress: String,
    storageType: {
      type: String,
      enum: ['warehouse', 'cold_storage', 'silo', 'open_yard']
    },
    storageConditions: {
      temperature: Number,
      humidity: Number,
      ventilation: String
    },
    expectedStorageDuration: Number, // in days
    storageStartDate: Date
  },
  
  // Processing Information
  processing: {
    isProcessed: {
      type: Boolean,
      default: false
    },
    processingType: String, // 'cleaning', 'sorting', 'packaging', 'milling'
    processingDate: Date,
    processingNotes: String,
    qualityAfterProcessing: {
      grade: String,
      lossPercentage: Number,
      finalQuantity: Number
    }
  },
  
  // Market and Pricing
  marketInfo: {
    purchasePrice: Number, // Price paid to farmer
    marketPrice: Number, // Current market price
    expectedSellingPrice: Number,
    pricePerUnit: Number,
    totalValue: Number,
    marketDemand: {
      type: String,
      enum: ['High', 'Medium', 'Low']
    }
  },
  
  // Transport and Logistics
  transport: {
    vehicleType: String,
    vehicleNumber: String,
    driverDetails: {
      name: String,
      phone: String,
      license: String
    },
    transportStartTime: Date,
    transportEndTime: Date,
    route: String,
    distance: Number,
    transportConditions: {
      temperature: Number,
      humidity: Number,
      handling: String
    },
    isDelivered: {
      type: Boolean,
      default: false
    }
  },
  
  // Buyer Information
  buyer: {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    buyerType: {
      type: String,
      enum: ['retailer', 'processor', 'exporter', 'consumer']
    },
    saleDate: Date,
    salePrice: Number,
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed'],
      default: 'pending'
    }
  },
  
  // Compliance and Certifications
  compliance: {
    foodSafetyCompliance: Boolean,
    organicCertification: Boolean,
    exportQuality: Boolean,
    regulatoryApprovals: [String],
    testReports: [{
      testType: String,
      result: String,
      testDate: Date,
      labName: String,
      certificateUrl: String
    }]
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: [
      'collected',
      'quality_checked',
      'stored',
      'processed',
      'ready_for_sale',
      'sold',
      'in_transit',
      'delivered',
      'rejected'
    ],
    default: 'collected'
  },
  
  // Notifications and Alerts
  alerts: [{
    type: String,
    message: String,
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical']
    },
    timestamp: Date,
    isResolved: {
      type: Boolean,
      default: false
    }
  }],
  
  // Analytics and Reporting
  analytics: {
    profitMargin: Number,
    lossPercentage: Number,
    timeInStorage: Number,
    customerSatisfaction: Number,
    returnOnInvestment: Number
  },
  
  // Metadata
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  notes: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
aggregatorCollectionSchema.index({ aggregator: 1, status: 1 });
aggregatorCollectionSchema.index({ collectionId: 1 });
aggregatorCollectionSchema.index({ sourceCrop: 1 });
aggregatorCollectionSchema.index({ farmer: 1 });
aggregatorCollectionSchema.index({ collectionDate: -1 });
aggregatorCollectionSchema.index({ 'blockchain.transactionHash': 1 });
aggregatorCollectionSchema.index({ 'traceability.batchNumber': 1 });

// Pre-save middleware to generate collection ID and batch number
aggregatorCollectionSchema.pre('save', function(next) {
  if (!this.collectionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.collectionId = `AGG-${timestamp}-${random}`.toUpperCase();
  }
  
  if (!this.traceability.batchNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 4);
    this.traceability.batchNumber = `BATCH-${date}-${random}`.toUpperCase();
  }
  
  next();
});

// Virtual for total profit
aggregatorCollectionSchema.virtual('totalProfit').get(function() {
  if (this.buyer.salePrice && this.marketInfo.purchasePrice) {
    return (this.buyer.salePrice - this.marketInfo.purchasePrice) * this.collectedQuantity;
  }
  return 0;
});

// Virtual for storage duration
aggregatorCollectionSchema.virtual('storageDuration').get(function() {
  if (this.storage.storageStartDate) {
    const now = new Date();
    const diffTime = Math.abs(now - this.storage.storageStartDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Method to add traceability entry
aggregatorCollectionSchema.methods.addTraceabilityEntry = function(stage, action, notes = '') {
  this.traceability.traceabilityChain.push({
    stage,
    actor: this.aggregator.toString(),
    timestamp: new Date(),
    location: this.collectionLocation.district,
    action,
    notes
  });
  return this.save();
};

// Method to update status and add traceability
aggregatorCollectionSchema.methods.updateStatus = function(newStatus, notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.addTraceabilityEntry(
    newStatus,
    `Status changed from ${oldStatus} to ${newStatus}`,
    notes
  );
  
  return this.save();
};

// Static method to get collections by aggregator
aggregatorCollectionSchema.statics.findByAggregator = function(aggregatorId, status = null) {
  const query = { aggregator: aggregatorId, isActive: true };
  if (status) query.status = status;
  return this.find(query)
    .populate('sourceCrop', 'name variety category')
    .populate('farmer', 'name phone address')
    .populate('buyer.buyerId', 'name phone')
    .sort({ collectionDate: -1 });
};

// Static method for analytics
aggregatorCollectionSchema.statics.getAnalytics = function(aggregatorId, dateRange = {}) {
  const matchStage = { aggregator: mongoose.Types.ObjectId(aggregatorId), isActive: true };
  if (dateRange.start && dateRange.end) {
    matchStage.collectionDate = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCollections: { $sum: 1 },
        totalQuantity: { $sum: '$collectedQuantity' },
        totalValue: { $sum: '$marketInfo.totalValue' },
        averageQuality: { $avg: '$qualityAssessment.qualityScore' },
        statusBreakdown: {
          $push: {
            status: '$status',
            count: 1
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('AggregatorCollection', aggregatorCollectionSchema);
