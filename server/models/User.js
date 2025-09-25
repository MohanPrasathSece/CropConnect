const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'aggregator', 'retailer', 'consumer', 'admin'],
    required: true
  },
  walletAddress: String,
  isActive: {
    type: Boolean,
    default: true
  },
  address: {
    village: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    fullAddress: String,
    isLocationDetected: {
      type: Boolean,
      default: false
    }
  },
  farmerDetails: {
    farmSize: Number,
    primaryCrops: [String],
    organicCertified: Boolean
  }
}, {
  timestamps: true
});

// No password hashing - storing plain text for simplicity

module.exports = mongoose.model('User', userSchema);
