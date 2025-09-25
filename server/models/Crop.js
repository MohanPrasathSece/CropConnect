const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  // Basic Crop Information
  name: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  variety: {
    type: String,
    required: [true, 'Crop variety is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['grains', 'vegetables', 'fruits', 'pulses', 'spices', 'cash_crops'],
    required: true
  },
  
  // Quantity and Pricing
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'tons', 'bags', 'quintal'],
    default: 'kg'
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price cannot be negative']
  },
  
  // Farmer Information
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Farm and Location Details
  farmLocation: {
    village: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Crop Quality and Certification
  quality: {
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'Premium'],
      default: 'A'
    },
    moistureContent: Number,
    purity: Number
  },
  isOrganic: {
    type: Boolean,
    default: false
  },
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  
  // Harvest Information
  harvestDate: {
    type: Date,
    required: true
  },
  sowingDate: Date,
  
  // Images and Media
  images: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  description: String,
  
  // AI Analysis Results
  aiAnalysis: {
    qualityScore: Number,
    recommendedPrice: Number,
    marketDemand: String,
    analyzedAt: Date
  },
  
  // Blockchain Integration
  blockchainHash: String,
  smartContractAddress: String,
  transactionHash: String,
  
  // QR Code and Traceability
  qrCode: {
    code: String,
    imageUrl: String,
    generatedAt: Date
  },
  traceabilityId: {
    type: String,
    unique: true
  },
  
  // Status and Availability
  status: {
    type: String,
    enum: ['draft', 'listed', 'sold', 'reserved', 'expired'],
    default: 'draft'
  },
  availability: {
    type: String,
    enum: ['available', 'partially_sold', 'sold_out'],
    default: 'available'
  },
  
  // Market Information
  listedAt: Date,
  views: {
    type: Number,
    default: 0
  },
  inquiries: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    contactInfo: String,
    inquiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reviews and Ratings
  ratings: [{
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    ratedAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  
  // Admin and Moderation
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
cropSchema.index({ farmer: 1, status: 1 });
cropSchema.index({ category: 1, status: 1 });
cropSchema.index({ 'farmLocation.district': 1, 'farmLocation.state': 1 });
cropSchema.index({ traceabilityId: 1 });

// Pre-save middleware to generate traceability ID
cropSchema.pre('save', function(next) {
  if (!this.traceabilityId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.traceabilityId = `CC-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Virtual for total value
cropSchema.virtual('totalValue').get(function() {
  return this.quantity * this.pricePerUnit;
});

// Method to increment views
cropSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to get crops by farmer
cropSchema.statics.findByFarmer = function(farmerId, status = null) {
  const query = { farmer: farmerId, isActive: true };
  if (status) query.status = status;
  return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('Crop', cropSchema);
