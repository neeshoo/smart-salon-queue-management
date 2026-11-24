const cron = require('node-cron');
const Booking = require('../models/Booking');
const Salon = require('../models/Salon');
const Notification = require('../models/Notification');
const { calculateQueueWaitTime } = require('../utils/waitTime');
const { sendLeaveNowAlert } = require('../utils/emailService');
const { broadcastQueueUpdate, notifyUser } = require('../sockets/socketHandler');

const initCronJobs = () => {
  console.log('[Cron] Initializing scheduled jobs...');

  // 1. Every 1 minute: Auto No-Show Handler & Leave Now alerts
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];

      // A. AUTO NO-SHOW: Check CALLED bookings that exceeded salon's autoNoShowMinutes (default 10)
      const calledBookings = await Booking.find({
        date: today,
        status: 'CALLED',
        calledAt: { $ne: null },
      }).populate('salonId');

      for (const booking of calledBookings) {
        const thresholdMinutes = booking.salonId?.autoNoShowMinutes || 10;
        const elapsedMinutes = Math.floor((now - new Date(booking.calledAt)) / 60000);

        if (elapsedMinutes >= thresholdMinutes) {
          booking.status = 'SKIPPED';
          booking.notes = `Auto-skipped after ${elapsedMinutes} mins with no arrival.`;
          await booking.save();

          console.log(`[Cron] Token ${booking.tokenFormatted} auto-skipped due to no-show.`);

          // Create notification for customer
          await Notification.create({
            userId: booking.customerId,
            salonId: booking.salonId?._id,
            bookingId: booking._id,
            title: 'Turn Skipped (No-Show)',
            message: `Your token ${booking.tokenFormatted} was skipped because you did not arrive within ${thresholdMinutes} minutes of being called.`,
            type: 'WARNING',
          });

          notifyUser(booking.customerId, 'notification:new', {
            title: 'Turn Skipped',
            message: `Your token ${booking.tokenFormatted} was skipped.`,
          });

          // Broadcast queue update to salon
          broadcastQueueUpdate(booking.salonId?._id, {
            type: 'TOKEN_SKIPPED',
            bookingId: booking._id,
          });
        }
      }

      // B. LEAVE NOW ALERTS: Check WAITING bookings where wait <= travelTime + 5 min buffer
      const waitingBookings = await Booking.find({
        date: today,
        status: 'WAITING',
        leaveAlertSent: false,
      }).populate('salonId');

      for (const b of waitingBookings) {
        if (!b.salonId) continue;
        const waitInfo = await calculateQueueWaitTime(b.salonId._id, b._id);
        const buffer = 5;
        const triggerTime = (b.travelTimeMinutes || 15) + buffer;

        if (waitInfo.estimatedWaitMinutes <= triggerTime) {
          b.leaveAlertSent = true;
          b.estimatedWaitMinutes = waitInfo.estimatedWaitMinutes;
          await b.save();

          console.log(`[Cron] Sending 'Leave Now' alert to ${b.customerName} for token ${b.tokenFormatted}`);

          // In-app notification
          await Notification.create({
            userId: b.customerId,
            salonId: b.salonId._id,
            bookingId: b._id,
            title: '🚗 Time to Leave!',
            message: `Estimated wait is down to ~${waitInfo.estimatedWaitMinutes} mins. Your travel time is ${b.travelTimeMinutes} mins. Leave now to arrive right on time!`,
            type: 'LEAVE_NOW',
          });

          notifyUser(b.customerId, 'leave:alert', {
            bookingId: b._id,
            tokenFormatted: b.tokenFormatted,
            waitMinutes: waitInfo.estimatedWaitMinutes,
            travelMinutes: b.travelTimeMinutes,
          });

          // Email notification
          await sendLeaveNowAlert(b, b.salonId.name, waitInfo.estimatedWaitMinutes);
        }
      }
    } catch (err) {
      console.error('[Cron Error]', err.message);
    }
  });

  console.log('[Cron] Active: Auto No-Show & Smart Leave Alert running every 60s.');
};

module.exports = { initCronJobs };
