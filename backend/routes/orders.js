const express = require('express');
const Order = require('../models/Order');

const router = express.Router();


// GET — all orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order
      .find()
      .populate('farmerId', 'name email')
      .populate('buyerId', 'name email')
      .populate('listingId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders'
    });
  }
});


// GET — orders available for route optimization
router.get('/route-data', async (req, res) => {
  try {

    const orders = await Order
      .find({
        orderStatus: {
          $in: ['CONFIRMED', 'IN TRANSIT']
        }
      })
      .populate('farmerId', 'name email')
      .populate('buyerId', 'name email')
      .populate('listingId');

    const routeOrders = orders
      .filter(order =>
        order.pickupLocation &&
        order.deliveryLocation
      )
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber,
        farmer: order.farmerId?.name || '',
        buyer: order.buyerId?.name || '',
        crop: order.items?.[0]?.crop || '',
        quantityKg: order.quantityKg,
        pickupLocation: order.pickupLocation,
        deliveryLocation: order.deliveryLocation,
        orderStatus: order.orderStatus
      }));

    res.json({
      success: true,
      orders: routeOrders
    });

  } catch (error) {

    console.error('Route data error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch route data'
    });

  }
});


// POST — create order
router.post('/', async (req, res) => {
  try {
    const order = await Order.create(req.body);

    res.status(201).json({
      success: true,
      order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// PUT — update order
router.put('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;