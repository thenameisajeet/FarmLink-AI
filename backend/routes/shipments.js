const express = require('express');
const Shipment = require('../models/Shipment');

const router = express.Router();


// GET — all shipments
router.get('/', async (req, res) => {
  try {
    const shipments = await Shipment
      .find()
      .populate('orderId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      shipments
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipments'
    });
  }
});


// POST — create shipment
router.post('/', async (req, res) => {
  try {
    const shipment = await Shipment.create(req.body);

    res.status(201).json({
      success: true,
      shipment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// PUT — update shipment
router.put('/:id', async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      shipment
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;