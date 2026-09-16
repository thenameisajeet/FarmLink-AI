const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },

    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: 'INR'
    },

    type: {
      type: String,
      enum: ['PURCHASE', 'REFUND', 'WITHDRAWAL'],
      required: true
    },

    status: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'DISPUTED'],
      default: 'PENDING'
    },

    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'BANK_TRANSFER', 'CASH'],
      required: true
    },

    transactionReference: {
      type: String,
      default: ''
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);