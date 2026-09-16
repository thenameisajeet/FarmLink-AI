const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    crop: {
      type: String,
      required: true,
      trim: true
    },

    quality: {
      type: String,
      required: true,
      trim: true
    },

    quantityKg: {
      type: Number,
      required: true,
      min: 1
    },

    askingPricePerQuintal: {
      type: Number,
      required: true,
      min: 0
    },

    availabilityDate: {
      type: Date,
      required: true
    },

    deliveryMode: {
      type: String,
      required: true
    },

    packagingDetails: {
      type: String,
      default: ''
    },

    status: {
      type: String,
      enum: ['live', 'negotiating', 'watching', 'paused', 'closed'],
      default: 'live'
    },

    offersCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Listing', listingSchema);