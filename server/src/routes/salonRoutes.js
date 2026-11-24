const express = require('express');
const router = express.Router();
const { getSalons, getSalonById, createSalon, updateSalon, getServicesBySalon } = require('../controllers/salonController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get('/', getSalons);
router.get('/:id/services', getServicesBySalon);
router.get('/:id', getSalonById);
router.post('/', protect, authorize('admin', 'superadmin'), requireFields(['name', 'phone']), createSalon);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateSalon);

module.exports = router;
