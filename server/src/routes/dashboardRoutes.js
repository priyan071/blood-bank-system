const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getDonorDashboard,
  getRequesterDashboard,
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/admin', protect, authorize('admin'), getAdminDashboard);
router.get('/donor', protect, authorize('donor'), getDonorDashboard);
router.get('/requester', protect, authorize('requester'), getRequesterDashboard);

module.exports = router;
