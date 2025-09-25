const express = require('express');
const { ethers } = require('ethers');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get blockchain network info
// @route   GET /api/v1/blockchain/network
// @access  Public
router.get('/network', async (req, res) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    res.json({
      success: true,
      network: {
        name: network.name,
        chainId: network.chainId,
        blockNumber
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get network info',
      error: error.message
    });
  }
});

// @desc    Get contract addresses
// @route   GET /api/v1/blockchain/contracts
// @access  Public
router.get('/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: {
      produceLedger: process.env.PRODUCE_LEDGER_ADDRESS,
      paymentManager: process.env.PAYMENT_MANAGER_ADDRESS
    }
  });
});

module.exports = router;
