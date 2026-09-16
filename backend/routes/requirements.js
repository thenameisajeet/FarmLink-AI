const express = require('express');
const BuyerRequirement = require('../models/BuyerRequirement');

const router = express.Router();


// GET — all buyer requirements
router.get('/', async (req, res) => {
  try {
    const requirements = await BuyerRequirement
      .find()
      .populate({
        path: 'buyerId',
        select: 'name email role'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requirements
    });

  } catch (error) {
    console.error('Failed to fetch buyer requirements:', error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


// POST — create buyer requirement
router.post('/', async (req, res) => {
  try {
    const requirement = await BuyerRequirement.create(req.body);

    res.status(201).json({
      success: true,
      requirement
    });

  } catch (error) {
    console.error('Failed to create buyer requirement:', error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// PUT — update buyer requirement
router.put('/:id', async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Buyer requirement not found'
      });
    }

    res.json({
      success: true,
      requirement
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// DELETE — delete buyer requirement
router.delete('/:id', async (req, res) => {
  try {
    const requirement = await BuyerRequirement.findByIdAndDelete(
      req.params.id
    );

    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Buyer requirement not found'
      });
    }

    res.json({
      success: true,
      message: 'Buyer requirement deleted successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;