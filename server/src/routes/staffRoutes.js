const express = require('express');
const router = express.Router();
const {
  getStaffBySalon,
  createStaff,
  updateStaffStatus,
  deleteStaff,
} = require('../controllers/staffController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get('/salon/:salonId', getStaffBySalon);
router.post('/', protect, authorize('admin', 'superadmin'), requireFields(['salonId', 'name']), createStaff);
router.patch('/:id/status', protect, requireFields(['status']), updateStaffStatus);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteStaff);

module.exports = router;
