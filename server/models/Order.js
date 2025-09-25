const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    default: function() {
      return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
  },
  
  // Crop Information
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  cropName: {
    type: String,
    required: true
  },
  
  // Farmer (Seller) Information
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmerName: {
    type: String,
    required: true
  },
  farmerEmail: {
    type: String,
    required: true
  },
  
  // Buyer Information
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: {
    type: String,
    required: true
  },
  buyerEmail: {
    type: String,
    required: true
  },
  buyerPhone: {
    type: String,
    required: true
  },
  
  // Order Details
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'quintal', 'tons', 'bags']
  },
  pricePerUnit: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'disputed'],
    default: 'pending'
  },
  
  // Delivery Information
  deliveryAddress: {
    fullAddress: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'completed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'digital_wallet', 'blockchain'],
    default: 'cash'
  },
  advancePayment: {
    type: Number,
    default: 0
  },
  
  // Important Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  
  // Additional Information
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Quality Requirements
  qualityRequirements: {
    grade: String,
    moistureContent: String,
    purity: String,
    specialRequests: String
  },
  
  // Tracking Information
  trackingUpdates: [{
    status: String,
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    location: String
  }],
  
  // Rating and Feedback (after delivery)
  farmerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  },
  buyerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
orderSchema.index({ farmerId: 1, status: 1 });
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ cropId: 1 });
orderSchema.index({ orderId: 1 });
orderSchema.index({ orderDate: -1 });

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24)); // days
});

// Method to update order status with tracking
orderSchema.methods.updateStatus = function(newStatus, message, location) {
  this.status = newStatus;
  this.trackingUpdates.push({
    status: newStatus,
    message: message || `Order status updated to ${newStatus}`,
    location: location || ''
  });
  return this.save();
};

// Method to calculate delivery estimate
orderSchema.methods.calculateDeliveryEstimate = function() {
  const baseDeliveryDays = 3; // Base delivery time
  const orderDate = new Date(this.orderDate);
  const estimatedDate = new Date(orderDate.getTime() + (baseDeliveryDays * 24 * 60 * 60 * 1000));
  return estimatedDate;
};

module.exports = mongoose.model('Order', orderSchema);
