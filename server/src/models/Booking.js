const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      default: '',
    },
    customerEmail: {
      type: String,
      default: '',
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
      },
    ],
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    type: {
      type: String,
      enum: ['QUEUE', 'APPOINTMENT'],
      default: 'QUEUE',
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    tokenFormatted: {
      type: String, // e.g. "T-001" or "VIP-002"
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
      index: true,
    },
    scheduledTime: {
      type: String, // "14:30" (for appointments)
      default: null,
    },
    status: {
      type: String,
      enum: ['WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED', 'SKIPPED', 'CANCELLED', 'NO_SHOW'],
      default: 'WAITING',
      index: true,
    },
    priority: {
      type: String,
      enum: ['NORMAL', 'VIP', 'SENIOR'],
      default: 'NORMAL',
    },
    priorityScore: {
      type: Number,
      default: 0, // Higher score processed earlier, but bounded to avoid starvation
    },
    travelTimeMinutes: {
      type: Number,
      default: 15, // customer travel time in minutes for Leave Now alert
    },
    leaveAlertSent: {
      type: Boolean,
      default: false,
    },
    estimatedWaitMinutes: {
      type: Number,
      default: 0,
    },
    totalDuration: {
      type: Number,
      default: 30, // in minutes
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    calledAt: {
      type: Date,
      default: null,
    },
    serviceStartedAt: {
      type: Date,
      default: null,
    },
    serviceCompletedAt: {
      type: Date,
      default: null,
    },
    actualDurationMinutes: {
      type: Number,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for salon daily queue ordering
bookingSchema.index({ salonId: 1, date: 1, status: 1, priorityScore: -1, tokenNumber: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
