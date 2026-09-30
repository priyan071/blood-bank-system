const express = require('express');
const router = express.Router();
const { getReportSummary } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/summary', protect, authorize('admin'), getReportSummary);

module.exports = router;
