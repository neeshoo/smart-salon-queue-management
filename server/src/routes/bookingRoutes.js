const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getMyBookings,
  cancelBooking,
  getBookingById,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.post('/', protect, requireFields(['salonId', 'serviceId', 'date', 'scheduledTime']), createAppointment);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/cancel', protect, cancelBooking);

module.exports = router;
