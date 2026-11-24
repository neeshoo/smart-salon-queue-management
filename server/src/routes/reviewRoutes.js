const express = require('express');
const router = express.Router();
const { createReview, getSalonReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.post('/', protect, requireFields(['salonId', 'bookingId', 'rating']), createReview);
router.get('/salon/:salonId', getSalonReviews);

module.exports = router;
