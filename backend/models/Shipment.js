const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },

    pickupLocation: {
      type: String,
      required: true
    },

    consolidationPoint: {
      type: String,
      default: ''
    },

    deliveryLocation: {
      type: String,
      required: true
    },

    vehicleId: {
      type: String,
      default: ''
    },

    driverId: {
      type: String,
      default: ''
    },

    quantityKg: {
      type: Number,
      required: true,
      min: 1
    },

    distanceKm: {
      type: Number,
      default: 0,
      min: 0
    },

    estimatedCost: {
      type: Number,
      default: 0,
      min: 0
    },

    optimizedCost: {
      type: Number,
      default: 0,
      min: 0
    },

    estimatedDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    actualDurationMinutes: {
      type: Number,
      default: 0,
      min: 0
    },

    status: {
      type: String,
      enum: [
        'PENDING',
        'ASSIGNED',
        'IN TRANSIT',
        'DELIVERED',
        'CANCELLED'
      ],
      default: 'PENDING'
    },

    pickupTime: {
      type: Date
    },

    deliveryTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Shipment', shipmentSchema);