const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Salon = require('../models/Salon');
const QueueCounter = require('../models/QueueCounter');
const Notification = require('../models/Notification');

// @desc    Book appointment slot
// @route   POST /api/bookings
// @access  Private (Customer)
const createAppointment = async (req, res, next) => {
  try {
    const { salonId, serviceId, staffId, date, scheduledTime, travelTimeMinutes } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) return res.status(404).json({ success: false, message: 'Salon not found' });

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });

    // Atomic token for appointment day
    const counter = await QueueCounter.findOneAndUpdate(
      { salonId, date },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tokenSeq = counter.seq;
    const tokenFormatted = `APT-${String(tokenSeq).padStart(3, '0')}`;

    const booking = await Booking.create({
      salonId,
      customerId: req.user._id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
      serviceId,
      services: [serviceId],
      staffId: staffId || null,
      type: 'APPOINTMENT',
      tokenNumber: tokenSeq,
      tokenFormatted,
      date,
      scheduledTime,
      status: 'WAITING',
      priority: 'NORMAL',
      travelTimeMinutes: Number(travelTimeMinutes) || 15,
      totalDuration: service.duration || 30,
      totalPrice: service.price,
    });

    await Notification.create({
      userId: req.user._id,
      salonId,
      bookingId: booking._id,
      title: 'Appointment Confirmed',
      message: `Your appointment at ${salon.name} is booked for ${date} at ${scheduledTime}.`,
      type: 'INFO',
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer booking & queue history
// @route   GET /api/bookings/my
// @access  Private (Customer)
const getMyBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    const total = await Booking.countDocuments({ customerId: req.user._id });
    const bookings = await Booking.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('salonId', 'name address phone logo')
      .populate('serviceId', 'name price duration')
      .populate('staffId', 'name');

    res.json({
      success: true,
      count: bookings.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private (Customer / Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Must be owner or admin
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin' &&
      booking.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (['COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a ${booking.status} booking` });
    }

    booking.status = 'CANCELLED';
    booking.notes = req.body.reason || 'Cancelled by user';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('salonId', 'name address phone logo openingHour closingHour autoNoShowMinutes')
      .populate('serviceId', 'name price duration avgActualDuration')
      .populate('staffId', 'name status avatar');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Allow customer to see their own booking, or staff/admin
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'superadmin' &&
      req.user.role !== 'staff' &&
      booking.customerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAppointment,
  getMyBookings,
  cancelBooking,
  getBookingById,
};
