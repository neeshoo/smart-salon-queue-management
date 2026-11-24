const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');

// @desc    Submit a review and rating for completed service
// @route   POST /api/reviews
// @access  Private (Customer)
const createReview = async (req, res, next) => {
  try {
    const { salonId, bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this service' });
    }

    // Check existing review
    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this service' });
    }

    const review = await Review.create({
      salonId,
      customerId: req.user._id,
      customerName: req.user.name,
      bookingId,
      rating: Number(rating),
      comment: comment || '',
    });

    // Recalculate average salon rating
    const reviews = await Review.find({ salonId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await Salon.findByIdAndUpdate(salonId, {
      rating: Number(avgRating.toFixed(1)),
      numReviews: reviews.length,
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a salon
// @route   GET /api/reviews/salon/:salonId
// @access  Public
const getSalonReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ salonId: req.params.salonId }).sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getSalonReviews,
};
