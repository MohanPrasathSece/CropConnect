const express = require('express');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/v1/auth/register
// @desc    Register a new user (simplified)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    // Basic validation
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user (password will be stored as plain text for simplicity)
    const user = new User({
      name,
      email,
      password, // Plain text password
      role,
      phone,
      // If address is provided from client (e.g., auto-detected during registration), save it
      ...(address ? { address: {
        village: address.village || '',
        district: address.district || '',
        state: address.state || '',
        pincode: address.pincode || '',
        coordinates: address.coordinates || undefined,
        fullAddress: address.fullAddress || '',
        isLocationDetected: address.isLocationDetected === true
      } } : {})
    });

    await user.save();

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/v1/auth/login
// @desc    Login user (simplified - just match email and password)
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Simple password comparison (plain text)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

module.exports = router;
