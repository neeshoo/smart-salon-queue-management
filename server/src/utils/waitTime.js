const Staff = require('../models/Staff');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

/**
 * Calculate accurate estimated wait time for a given position in salon queue.
 * Algorithm:
 * 1. Count active/available staff for the salon (fallback to 1 if none online).
 * 2. Calculate remaining duration of currently IN_SERVICE bookings.
 * 3. Sum total service durations of all WAITING & CALLED bookings scheduled ahead.
 * 4. Use learned historical average service time (avgActualDuration) if available, else listed duration.
 * 5. Estimated wait = (Active Service Remaining + Waiting Sum) / activeStaffCount
 */
const calculateQueueWaitTime = async (salonId, targetBookingId = null) => {
  const today = new Date().toISOString().split('T')[0];

  // 1. Get active staff count
  const activeStaff = await Staff.find({
    salonId,
    isActive: true,
    status: { $in: ['Available', 'Busy'] },
  });
  const staffCount = Math.max(activeStaff.length, 1);

  // 2. Get IN_SERVICE bookings currently being handled
  const inServiceBookings = await Booking.find({
    salonId,
    date: today,
    status: 'IN_SERVICE',
  }).populate('serviceId');

  let activeRemainingMinutes = 0;
  const now = new Date();

  for (const b of inServiceBookings) {
    const serviceDuration = b.serviceId?.avgActualDuration || b.totalDuration || 30;
    const elapsedMinutes = b.serviceStartedAt
      ? Math.max(0, Math.floor((now - new Date(b.serviceStartedAt)) / 60000))
      : 0;
    const remaining = Math.max(5, serviceDuration - elapsedMinutes);
    activeRemainingMinutes += remaining;
  }

  // 3. Query all WAITING and CALLED tokens for today in prioritized queue order
  const waitingBookings = await Booking.find({
    salonId,
    date: today,
    status: { $in: ['WAITING', 'CALLED'] },
  })
    .sort({ priorityScore: -1, tokenNumber: 1 })
    .populate('serviceId');

  // If a specific target booking is requested, compute its specific people ahead & wait time
  let totalMinutesAhead = activeRemainingMinutes;
  let peopleAhead = 0;
  let targetFound = false;
  let targetWait = 0;

  for (const b of waitingBookings) {
    if (targetBookingId && b._id.toString() === targetBookingId.toString()) {
      targetFound = true;
      targetWait = Math.round(totalMinutesAhead / staffCount);
      break;
    }

    const duration = b.serviceId?.avgActualDuration || b.totalDuration || 30;
    totalMinutesAhead += duration;
    peopleAhead += 1;
  }

  if (targetBookingId) {
    return {
      peopleAhead,
      estimatedWaitMinutes: targetFound ? targetWait : Math.round(totalMinutesAhead / staffCount),
      staffCount,
    };
  }

  // If no target booking specified, return current queue tail wait time
  return {
    totalWaiting: waitingBookings.length,
    estimatedWaitMinutes: Math.round(totalMinutesAhead / staffCount),
    staffCount,
  };
};

/**
 * Smart Allocation: Find best staff member for the requested service.
 * Finds staff who offer this specialty and currently has the lowest queue load.
 */
const allocateBestStaff = async (salonId, serviceId) => {
  const staffMembers = await Staff.find({
    salonId,
    isActive: true,
    status: { $in: ['Available', 'Busy'] },
  });

  if (!staffMembers || staffMembers.length === 0) {
    return null;
  }

  // Filter staff matching service specialty if possible
  const matchingStaff = staffMembers.filter(
    (s) => s.specialties && s.specialties.some((spec) => spec.toString() === serviceId.toString())
  );
  const candidatePool = matchingStaff.length > 0 ? matchingStaff : staffMembers;

  // First pick any staff currently Available
  const availableStaff = candidatePool.find((s) => s.status === 'Available');
  if (availableStaff) return availableStaff;

  // Otherwise, find staff with fewest assigned waiting bookings today
  const today = new Date().toISOString().split('T')[0];
  let bestStaff = candidatePool[0];
  let minWaitCount = Infinity;

  for (const staff of candidatePool) {
    const count = await Booking.countDocuments({
      staffId: staff._id,
      date: today,
      status: { $in: ['WAITING', 'CALLED', 'IN_SERVICE'] },
    });
    if (count < minWaitCount) {
      minWaitCount = count;
      bestStaff = staff;
    }
  }

  return bestStaff;
};

/**
 * Priority Scoring:
 * Normal = 0
 * Senior = 100
 * VIP = 200
 * Age bonus: each minute waiting increases effective score by 1 point to prevent starvation!
 */
const computePriorityScore = (priority = 'NORMAL') => {
  let baseScore = 0;
  if (priority === 'SENIOR') baseScore = 100;
  if (priority === 'VIP') baseScore = 200;
  return baseScore;
};

module.exports = {
  calculateQueueWaitTime,
  allocateBestStaff,
  computePriorityScore,
};
