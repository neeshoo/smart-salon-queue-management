const Staff = require('../models/Staff');
const Salon = require('../models/Salon');
const User = require('../models/User');

// @desc    Get staff for a salon
// @route   GET /api/staff/salon/:salonId
// @access  Public / Private
const getStaffBySalon = async (req, res, next) => {
  try {
    const staff = await Staff.find({ salonId: req.params.salonId, isActive: true })
      .populate('specialties', 'name price duration')
      .populate('currentBookingId');
    res.json({ success: true, count: staff.length, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new staff member
// @route   POST /api/staff
// @access  Private (Admin)
const createStaff = async (req, res, next) => {
  try {
    const { salonId, name, email, phone, specialties, avatar } = req.body;

    const salon = await Salon.findById(salonId);
    if (!salon) {
      return res.status(404).json({ success: false, message: 'Salon not found' });
    }

    // Optionally check if a user with this email exists to link staff role
    let linkedUser = null;
    if (email) {
      linkedUser = await User.findOne({ email });
      if (linkedUser && linkedUser.role === 'customer') {
        linkedUser.role = 'staff';
        linkedUser.salonId = salonId;
        await linkedUser.save();
      }
    }

    const staff = await Staff.create({
      salonId,
      name,
      email: email || '',
      phone: phone || '',
      specialties: specialties || [],
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      userId: linkedUser ? linkedUser._id : null,
      status: 'Available',
    });

    res.status(201).json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff status (Available / Busy / On Break / Off Duty)
// @route   PATCH /api/staff/:id/status
// @access  Private (Staff / Admin)
const updateStaffStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Available', 'Busy', 'On Break', 'Off Duty'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    staff.status = status;
    await staff.save();

    res.json({ success: true, staff });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Deactivate staff member
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
const deleteStaff = async (req, res, next) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' });
    }

    staff.isActive = false;
    await staff.save();

    res.json({ success: true, message: 'Staff deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStaffBySalon,
  createStaff,
  updateStaffStatus,
  deleteStaff,
};
