const mongoose = require('mongoose');

const buyerConnectionSchema = new mongoose.Schema(
  {
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

    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BuyerRequirement',
      required: true
    },

    status: {
      type: String,
      enum: ['REQUESTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
      default: 'REQUESTED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  'BuyerConnection',
  buyerConnectionSchema
);