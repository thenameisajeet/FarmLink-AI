const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true
    },

    items: [
      {
        crop: {
          type: String,
          required: true
        },
        quantityKg: {
          type: Number,
          required: true,
          min: 1
        },
        pricePerQuintal: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    quantityKg: {
      type: Number,
      required: true,
      min: 1
    },

    agreedPrice: {
      type: Number,
      required: true,
      min: 0
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    orderStatus: {
      type: String,
      enum: [
        'ACTION',
        'CONFIRMED',
        'IN TRANSIT',
        'DELIVERED',
        'CANCELLED'
      ],
      default: 'ACTION'
    },

    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },

    deliveryAddress: {
      type: String,
      default: ''
    },

    pickupLocation: {
      type: String,
      default: ''
    },

    deliveryLocation: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);