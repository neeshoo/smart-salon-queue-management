const mongoose = require('mongoose');

const queueCounterSchema = new mongoose.Schema(
  {
    salonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    seq: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

queueCounterSchema.index({ salonId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('QueueCounter', queueCounterSchema);
