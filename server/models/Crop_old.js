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
  farmerName: String,
  farmerPhone: String,
  
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
    type: String,
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
    default: 'harvested'
  },
  blockchainTxHash: String,
  produceId: Number,
  qrCode: String,
  isOrganic: {
    type: Boolean,
    default: false
  },
  certifications: [String],
  pesticidesUsed: [String],
  fertilizersUsed: [String]
}, {
  timestamps: true
});

cropSchema.index({ farmer: 1 });
cropSchema.index({ cropType: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ harvestDate: 1 });

module.exports = mongoose.model('Crop', cropSchema);
