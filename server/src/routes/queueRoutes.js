const express = require('express');
const router = express.Router();
const {
  joinQueue,
  getSalonQueue,
  getMyQueueStatus,
  callNextToken,
  updateTokenStatus,
  addWalkIn,
} = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/auth');
const { requireFields } = require('../middleware/validate');

router.post('/join', protect, requireFields(['salonId', 'serviceId']), joinQueue);
router.post('/:salonId/join', protect, requireFields(['serviceId']), joinQueue);
router.get('/:salonId', getSalonQueue);
router.get('/:salonId/my-status', protect, getMyQueueStatus);
router.post('/:salonId/next', protect, authorize('staff', 'admin', 'superadmin'), callNextToken);
router.patch('/:salonId/:bookingId/status', protect, authorize('staff', 'admin', 'superadmin'), requireFields(['status']), updateTokenStatus);
router.post('/:salonId/walk-in', protect, authorize('staff', 'admin', 'superadmin'), requireFields(['serviceId']), addWalkIn);

module.exports = router;
