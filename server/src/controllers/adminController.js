const User = require('../models/User');
const Salon = require('../models/Salon');
const Booking = require('../models/Booking');

// @desc    Get Super Admin dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Superadmin)
const getSuperAdminDashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSalons = await Salon.countDocuments();
    const pendingSalons = await Salon.countDocuments({ isApproved: false });
    const totalBookings = await Booking.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalSalons,
        pendingSalons,
        totalBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Superadmin)
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all salons (with approval status)
// @route   GET /api/admin/salons
// @access  Private (Superadmin)
const getAllSalons = async (req, res, next) => {
  try {
    const salons = await Salon.find().populate('ownerId', 'name email phone').sort({ createdAt: -1 });
    res.json({ success: true, count: salons.length, salons });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve / Reject / Toggle salon
// @route   PATCH /api/admin/salons/:id/approval
// @access  Private (Superadmin)
const updateSalonApproval = async (req, res, next) => {
  try {
    const { isApproved, isActive } = req.body;
    const salon = await Salon.findById(req.params.id);

    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    if (isApproved !== undefined) salon.isApproved = isApproved;
    if (isActive !== undefined) salon.isActive = isActive;

    await salon.save();

    res.json({ success: true, salon });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSuperAdminDashboard,
  getAllUsers,
  getAllSalons,
  updateSalonApproval,
};
