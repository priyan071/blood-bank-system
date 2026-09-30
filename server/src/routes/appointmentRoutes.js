const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments,
  updateAppointmentStatus,
  completeDonationAndCollect,
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.route('/')
  .post(protect, createAppointment)
  .get(protect, getAppointments);

router.put('/:id/status', protect, updateAppointmentStatus);
router.post('/:id/complete-donation', protect, authorize('admin'), completeDonationAndCollect);

module.exports = router;
