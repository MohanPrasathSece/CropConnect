const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const createTestUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('📊 Connected to MongoDB');

    // Create test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: '123456', // Plain text password
      role: 'farmer',
      phone: '+91 9876543210'
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@test.com');
    console.log('🔑 Password: 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();
