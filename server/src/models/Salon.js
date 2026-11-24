const mongoose = require('mongoose');

const salonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Salon name is required'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, default: '' },
      zipCode: { type: String, default: '' },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.2090, 28.6139],
      },
    },
    description: {
      type: String,
      default: '',
    },
    images: [{ type: String }],
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=500&q=80',
    },
    openingHour: {
      type: String,
      default: '09:00',
    },
    closingHour: {
      type: String,
      default: '21:00',
    },
    workingDays: {
      type: [String],
      default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    autoNoShowMinutes: {
      type: Number,
      default: 10, // minutes to wait after calling before auto-skipping
    },
    maxDailyQueue: {
      type: Number,
      default: 100,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ['Budget Barber', 'Neighborhood Salon', 'Modern Grooming', 'Unisex Salon', 'Premium Salon', 'Family Salon'],
      default: 'Neighborhood Salon',
    },
    startingPrice: {
      type: Number,
      default: 0,
    },
    area: {
      type: String,
      default: '',
    },
    qrCodeData: {
      type: String, // Base64 data URL
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

salonSchema.index({ 'address.city': 1, name: 1 });
salonSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Salon', salonSchema);
