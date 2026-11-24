const Booking = require('../models/Booking');
const Staff = require('../models/Staff');
const Salon = require('../models/Salon');

// @desc    Get comprehensive analytics for salon dashboard
// @route   GET /api/analytics/:salonId
// @access  Private (Admin / Superadmin)
const getSalonAnalytics = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    // 1. Overview counts for today
    const totalToday = await Booking.countDocuments({ salonId, date: today });
    const waitingToday = await Booking.countDocuments({ salonId, date: today, status: 'WAITING' });
    const completedToday = await Booking.countDocuments({ salonId, date: today, status: 'COMPLETED' });
    const skippedToday = await Booking.countDocuments({ salonId, date: today, status: { $in: ['SKIPPED', 'NO_SHOW'] } });

    // Revenue today
    const completedBookingsToday = await Booking.find({ salonId, date: today, status: 'COMPLETED' });
    const revenueToday = completedBookingsToday.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

    // Average actual wait & service duration today
    let avgWaitTime = 0;
    if (completedBookingsToday.length > 0) {
      const waitSum = completedBookingsToday.reduce((sum, b) => sum + (b.estimatedWaitMinutes || 15), 0);
      avgWaitTime = Math.round(waitSum / completedBookingsToday.length);
    }

    // 2. Customers per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dateLimit = sevenDaysAgo.toISOString().split('T')[0];

    const dailyStats = await Booking.aggregate([
      { $match: { salonId: new (require('mongoose').Types.ObjectId)(salonId), date: { $gte: dateLimit } } },
      {
        $group: {
          _id: '$date',
          totalCustomers: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
          },
          revenue: {
            $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, '$totalPrice', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Peak hours analysis (hourly distribution)
    const allBookings = await Booking.find({
      salonId,
      createdAt: { $gte: sevenDaysAgo },
    });

    const hourlyMap = {};
    for (let h = 9; h <= 21; h++) {
      const label = `${h}:00`;
      hourlyMap[label] = 0;
    }

    allBookings.forEach((b) => {
      const hour = new Date(b.createdAt).getHours();
      const label = `${hour}:00`;
      if (hourlyMap[label] !== undefined) {
        hourlyMap[label] += 1;
      }
    });

    const peakHoursData = Object.keys(hourlyMap).map((hour) => ({
      hour,
      customers: hourlyMap[hour],
    }));

    // 4. Staff Performance
    const staffList = await Staff.find({ salonId, isActive: true });
    const staffPerformance = [];

    for (const st of staffList) {
      const count = await Booking.countDocuments({
        salonId,
        staffId: st._id,
        status: 'COMPLETED',
      });
      staffPerformance.push({
        staffId: st._id,
        name: st.name,
        completedServices: count,
        rating: st.rating,
        status: st.status,
      });
    }

    // 5. No-Show Rate
    const totalBookingsAll = await Booking.countDocuments({ salonId });
    const totalNoShows = await Booking.countDocuments({ salonId, status: { $in: ['SKIPPED', 'NO_SHOW'] } });
    const noShowRate = totalBookingsAll > 0 ? Number(((totalNoShows / totalBookingsAll) * 100).toFixed(1)) : 0;

    res.json({
      success: true,
      summary: {
        totalToday,
        waitingToday,
        completedToday,
        skippedToday,
        revenueToday,
        avgWaitTime,
        noShowRate,
      },
      dailyStats,
      peakHoursData,
      staffPerformance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export booking reports as CSV
// @route   GET /api/analytics/:salonId/export
// @access  Private (Admin)
const exportReportCSV = async (req, res, next) => {
  try {
    const { salonId } = req.params;
    const bookings = await Booking.find({ salonId })
      .sort({ createdAt: -1 })
      .populate('serviceId', 'name price')
      .populate('staffId', 'name');

    let csv = 'Token,Date,Customer Name,Phone,Service,Staff,Status,Price,Duration(min),Type\n';

    bookings.forEach((b) => {
      const row = [
        `"${b.tokenFormatted}"`,
        `"${b.date}"`,
        `"${b.customerName}"`,
        `"${b.customerPhone || ''}"`,
        `"${b.serviceId?.name || 'N/A'}"`,
        `"${b.staffId?.name || 'Unassigned'}"`,
        `"${b.status}"`,
        `"${b.totalPrice || 0}"`,
        `"${b.totalDuration || 30}"`,
        `"${b.type}"`,
      ].join(',');
      csv += row + '\n';
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`salon_report_${Date.now()}.csv`);
    return res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSalonAnalytics,
  exportReportCSV,
};
