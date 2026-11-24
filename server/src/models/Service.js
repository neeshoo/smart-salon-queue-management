const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Haircut', 'Beard & Shave', 'Styling', 'Spa & Facial', 'Coloring', 'Treatment', 'Other'],
      default: 'Haircut',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    duration: {
      type: Number,
      required: [true, 'Estimated duration in minutes is required'],
      min: 5,
      default: 30, // in minutes
    },
    avgActualDuration: {
      type: Number,
      default: 30, // learned from actual historical completion times
    },
    totalCompletedCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Service', serviceSchema);
