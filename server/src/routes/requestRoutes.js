const express = require('express');
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  approveRequest,
  approveAndFulfillRequest,
  rejectRequest,
} = require('../controllers/requestController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.route('/')
  .post(protect, authorize('requester', 'admin'), createRequest)
  .get(protect, authorize('admin'), getAllRequests);

router.get('/my', protect, authorize('requester'), getMyRequests);
router.put('/:id/approve', protect, authorize('admin'), approveRequest);
router.put('/:id/fulfill', protect, authorize('admin'), approveAndFulfillRequest);
router.put('/:id/reject', protect, authorize('admin'), rejectRequest);

module.exports = router;
