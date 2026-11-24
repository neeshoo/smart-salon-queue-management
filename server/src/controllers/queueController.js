const Booking = require('../models/Booking');
const QueueCounter = require('../models/QueueCounter');
const Service = require('../models/Service');
const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const Notification = require('../models/Notification');
const { calculateQueueWaitTime, allocateBestStaff, computePriorityScore } = require('../utils/waitTime');
const { broadcastQueueUpdate, notifyUser } = require('../sockets/socketHandler');

// @desc    Join Virtual Queue remotely
// @route   POST /api/queue/join
// @access  Private (Customer)
const joinQueue = async (req, res, next) => {
  try {
    const salonId = req.body.salonId || req.params.salonId;
    const { serviceId, staffId, priority, travelTimeMinutes, customerName, customerPhone } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Check salon
    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    // Check service
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if customer already has an active WAITING or CALLED token in this salon today
    const existingActive = await Booking.findOne({
      salonId,
      customerId: req.user._id,
      date: today,
      status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
    });

    if (existingActive) {
      return res.status(400).json({
        success: false,
        message: `You already have an active token (${existingActive.tokenFormatted}) in this salon.`,
        booking: existingActive,
      });
    }

    // 1. Race-condition safe atomic token counter per salon per day
    const counter = await QueueCounter.findOneAndUpdate(
      { salonId, date: today },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tokenSeq = counter.seq;
    const priorityType = priority || 'NORMAL';
    const prefix = priorityType === 'VIP' ? 'VIP' : priorityType === 'SENIOR' ? 'SNR' : 'T';
    const tokenFormatted = `${prefix}-${String(tokenSeq).padStart(3, '0')}`;

    // 2. Smart staff allocation (if staffId was not chosen explicitly)
    let assignedStaffId = staffId || null;
    if (!assignedStaffId) {
      const bestStaff = await allocateBestStaff(salonId, serviceId);
      if (bestStaff) {
        assignedStaffId = bestStaff._id;
      }
    }

    // 3. Priority score calculation
    const basePriorityScore = computePriorityScore(priorityType);

    // 4. Create booking / queue entry
    const booking = await Booking.create({
      salonId,
      customerId: req.user._id,
      customerName: customerName || req.user.name,
      customerEmail: req.user.email,
      customerPhone: customerPhone || req.user.phone,
      serviceId,
      services: [serviceId],
      staffId: assignedStaffId,
      type: 'QUEUE',
      tokenNumber: tokenSeq,
      tokenFormatted,
      date: today,
      status: 'WAITING',
      priority: priorityType,
      priorityScore: basePriorityScore,
      travelTimeMinutes: Number(travelTimeMinutes) || 15,
      totalDuration: service.avgActualDuration || service.duration || 30,
      totalPrice: service.price,
    });

    // 5. Calculate live wait time
    const waitInfo = await calculateQueueWaitTime(salonId, booking._id);
    booking.estimatedWaitMinutes = waitInfo.estimatedWaitMinutes;
    await booking.save();

    // 6. Create Notification
    await Notification.create({
      userId: req.user._id,
      salonId,
      bookingId: booking._id,
      title: 'Joined Queue Successfully',
      message: `Your token is ${tokenFormatted}. Position: ${waitInfo.peopleAhead + 1}, Estimated wait: ~${waitInfo.estimatedWaitMinutes} mins.`,
      type: 'INFO',
    });

    // 7. Real-time broadcast
    broadcastQueueUpdate(salonId, {
      type: 'QUEUE_JOINED',
      bookingId: booking._id,
      tokenFormatted,
    });

    res.status(201).json({
      success: true,
      message: 'Joined queue successfully',
      booking,
      peopleAhead: waitInfo.peopleAhead,
      estimatedWaitMinutes: waitInfo.estimatedWaitMinutes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get live queue for a salon (Today)
// @route   GET /api/queue/:salonId
// @access  Public / Private
const getSalonQueue = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // Fetch active bookings for today
    const queue = await Booking.find({
      salonId,
      date: today,
      status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
    })
      .sort({ priorityScore: -1, tokenNumber: 1 })
      .populate('serviceId', 'name price duration avgActualDuration')
      .populate('staffId', 'name status avatar');

    // Currently serving tokens
    const inService = queue.filter((b) => b.status === 'IN_SERVICE');
    const called = queue.filter((b) => b.status === 'CALLED');
    const waiting = queue.filter((b) => b.status === 'WAITING');

    const waitSummary = await calculateQueueWaitTime(salonId);

    res.json({
      success: true,
      today,
      totalWaiting: waiting.length,
      totalInService: inService.length,
      totalCalled: called.length,
      estimatedWaitMinutes: waitSummary.estimatedWaitMinutes,
      activeStaffCount: waitSummary.staffCount,
      inService,
      called,
      waiting,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking status for specific booking or current user's active token
// @route   GET /api/queue/:salonId/my-status
// @access  Private
const getMyQueueStatus = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { bookingId } = req.query;
    const today = new Date().toISOString().split('T')[0];

    let booking;
    if (bookingId) {
      booking = await Booking.findById(bookingId)
        .populate('serviceId')
        .populate('staffId')
        .populate('salonId', 'name phone address openingHour closingHour autoNoShowMinutes');
    } else {
      booking = await Booking.findOne({
        salonId,
        customerId: req.user._id,
        date: today,
        status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
      })
        .populate('serviceId')
        .populate('staffId')
        .populate('salonId', 'name phone address openingHour closingHour autoNoShowMinutes');
    }

    if (!booking) {
      return res.json({
        success: true,
        hasActiveBooking: false,
        message: 'No active queue token found.',
      });
    }

    // Calculate position and remaining wait
    const waitInfo = await calculateQueueWaitTime(booking.salonId._id || salonId, booking._id);

    res.json({
      success: true,
      hasActiveBooking: true,
      booking,
      peopleAhead: waitInfo.peopleAhead,
      estimatedWaitMinutes: waitInfo.estimatedWaitMinutes,
      staffCount: waitInfo.staffCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Call next token in queue
// @route   POST /api/queue/:salonId/next
// @access  Private (Staff / Admin)
const callNextToken = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { staffId } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Find next eligible WAITING token
    let query = {
      salonId,
      date: today,
      status: 'WAITING',
    };

    if (staffId) {
      query.$or = [{ staffId }, { staffId: null }];
    }

    const nextBooking = await Booking.findOne(query)
      .sort({ priorityScore: -1, tokenNumber: 1 })
      .populate('serviceId');

    if (!nextBooking) {
      return res.status(404).json({
        success: false,
        message: 'No waiting customers in queue.',
      });
    }

    nextBooking.status = 'CALLED';
    nextBooking.calledAt = new Date();
    if (staffId) nextBooking.staffId = staffId;
    await nextBooking.save();

    // Notify customer in-app
    await Notification.create({
      userId: nextBooking.customerId,
      salonId,
      bookingId: nextBooking._id,
      title: '🚨 YOUR TURN!',
      message: `Token ${nextBooking.tokenFormatted}: Please proceed to the service counter now!`,
      type: 'YOUR_TURN',
    });

    notifyUser(nextBooking.customerId, 'token:called', {
      bookingId: nextBooking._id,
      tokenFormatted: nextBooking.tokenFormatted,
      calledAt: nextBooking.calledAt,
    });

    broadcastQueueUpdate(salonId, {
      type: 'TOKEN_CALLED',
      bookingId: nextBooking._id,
      tokenFormatted: nextBooking.tokenFormatted,
    });

    res.json({
      success: true,
      message: `Token ${nextBooking.tokenFormatted} called successfully.`,
      booking: nextBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update queue token status (Start Service, Complete, Skip, Cancel)
// @route   PATCH /api/queue/:salonId/:bookingId/status
// @access  Private (Staff / Admin)
const updateTokenStatus = async (req, res, next) => {
  try {
    const { salonId, bookingId } = req.params;
    const { status, staffId } = req.body;

    const booking = await Booking.findById(bookingId).populate('serviceId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const now = new Date();
    booking.status = status;

    if (status === 'IN_SERVICE') {
      booking.serviceStartedAt = now;
      if (staffId) {
        booking.staffId = staffId;
        await Staff.findByIdAndUpdate(staffId, { status: 'Busy', currentBookingId: booking._id });
      }
    } else if (status === 'COMPLETED') {
      booking.serviceCompletedAt = now;
      if (booking.serviceStartedAt) {
        const actualMinutes = Math.max(5, Math.round((now - new Date(booking.serviceStartedAt)) / 60000));
        booking.actualDurationMinutes = actualMinutes;

        // Learn historical average service time via moving average
        if (booking.serviceId) {
          const service = await Service.findById(booking.serviceId._id);
          if (service) {
            const count = service.totalCompletedCount || 0;
            const currentAvg = service.avgActualDuration || service.duration || 30;
            // Weighted moving average
            const newAvg = Math.round((currentAvg * count + actualMinutes) / (count + 1));
            service.avgActualDuration = newAvg;
            service.totalCompletedCount = count + 1;
            await service.save();
          }
        }
      }

      // Free up staff member
      if (booking.staffId) {
        await Staff.findByIdAndUpdate(booking.staffId, { status: 'Available', currentBookingId: null });
      }

      // Notify completion
      await Notification.create({
        userId: booking.customerId,
        salonId,
        bookingId: booking._id,
        title: 'Service Completed',
        message: `Thank you for visiting! Please rate your experience for token ${booking.tokenFormatted}.`,
        type: 'COMPLETED',
      });
    } else if (['SKIPPED', 'NO_SHOW', 'CANCELLED'].includes(status)) {
      if (booking.staffId) {
        await Staff.findByIdAndUpdate(booking.staffId, { status: 'Available', currentBookingId: null });
      }
    }

    await booking.save();

    // Broadcast queue update to all in salon
    broadcastQueueUpdate(salonId, {
      type: 'STATUS_CHANGED',
      bookingId: booking._id,
      status,
    });

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add manual walk-in customer (Admin/Staff)
// @route   POST /api/queue/:salonId/walk-in
// @access  Private (Staff / Admin)
const addWalkIn = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const { customerName, customerPhone, serviceId, staffId, priority } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Atomic token sequence
    const counter = await QueueCounter.findOneAndUpdate(
      { salonId, date: today },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const tokenSeq = counter.seq;
    const priorityType = priority || 'NORMAL';
    const prefix = priorityType === 'VIP' ? 'VIP' : priorityType === 'SENIOR' ? 'SNR' : 'W';
    const tokenFormatted = `${prefix}-${String(tokenSeq).padStart(3, '0')}`;

    const booking = await Booking.create({
      salonId,
      customerId: req.user._id, // Tied to admin account for walk-in
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || '',
      serviceId,
      services: [serviceId],
      staffId: staffId || null,
      type: 'QUEUE',
      tokenNumber: tokenSeq,
      tokenFormatted,
      date: today,
      status: 'WAITING',
      priority: priorityType,
      priorityScore: computePriorityScore(priorityType),
      travelTimeMinutes: 0,
      totalDuration: service.avgActualDuration || service.duration || 30,
      totalPrice: service.price,
    });

    broadcastQueueUpdate(salonId, {
      type: 'WALK_IN_ADDED',
      bookingId: booking._id,
      tokenFormatted,
    });

    res.status(201).json({
      success: true,
      message: 'Walk-in customer added to queue',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinQueue,
  getSalonQueue,
  getMyQueueStatus,
  callNextToken,
  updateTokenStatus,
  addWalkIn,
};
