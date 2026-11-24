const express = require('express');
const router = express.Router();
const {
  getSuperAdminDashboard,
  getAllUsers,
  getAllSalons,
  updateSalonApproval,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('superadmin'));

router.get('/dashboard', getSuperAdminDashboard);
router.get('/users', getAllUsers);
router.get('/salons', getAllSalons);
router.patch('/salons/:id/approval', updateSalonApproval);

module.exports = router;
