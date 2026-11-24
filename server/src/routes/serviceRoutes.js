const express = require('express');
const router = express.Router();
const {
  getServicesBySalon,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.get('/salon/:id', getServicesBySalon);
router.post('/', protect, authorize('admin', 'superadmin'), requireFields(['salonId', 'name', 'price', 'duration']), createService);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateService);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteService);

module.exports = router;
