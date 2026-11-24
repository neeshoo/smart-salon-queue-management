const express = require('express');
const router = express.Router();
const { getSalonAnalytics, exportReportCSV } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/:salonId', protect, authorize('admin', 'superadmin'), getSalonAnalytics);
router.get('/:salonId/export', protect, authorize('admin', 'superadmin'), exportReportCSV);

module.exports = router;
