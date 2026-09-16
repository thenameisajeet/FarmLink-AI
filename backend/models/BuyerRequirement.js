const mongoose = require('mongoose');

const buyerRequirementSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    crop: {
      type: String,
      required: true,
      trim: true
    },

    requiredQuantityKg: {
      type: Number,
      required: true,
      min: 1
    },

    quality: {
      type: String,
      required: true,
      trim: true
    },

    minPrice: {
      type: Number,
      min: 0
    },

    maxPrice: {
      type: Number,
      min: 0
    },

    region: {
      type: String,
      required: true,
      trim: true
    },

    buyingStartDate: {
      type: Date,
      required: true
    },

    buyingEndDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'FULFILLED'],
      default: 'OPEN'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'BuyerRequirement',
  buyerRequirementSchema
);