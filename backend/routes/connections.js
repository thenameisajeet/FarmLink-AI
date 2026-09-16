const express = require('express');
const BuyerConnection = require('../models/BuyerConnection');

const router = express.Router();


// GET — all connections
router.get('/', async (req, res) => {
  try {
    const connections = await BuyerConnection
      .find()
      .populate('farmerId', 'name email')
      .populate('buyerId', 'name email')
      .populate('listingId')
      .populate('requirementId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      connections
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connections'
    });
  }
});


// POST — create connection
router.post('/', async (req, res) => {
  try {
    const connection = await BuyerConnection.create(req.body);

    res.status(201).json({
      success: true,
      connection
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// PUT — update connection status
router.put('/:id', async (req, res) => {
  try {
    const connection = await BuyerConnection.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    res.json({
      success: true,
      connection
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;