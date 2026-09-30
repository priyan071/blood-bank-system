const express = require('express');
const router = express.Router();
const {
  getAllDonors,
  getDonorById,
  updateDonorVitals,
  checkMyEligibility,
  overrideEligibility,
} = require('../controllers/donorController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin'), getAllDonors);
router.post('/check-eligibility', protect, checkMyEligibility);
router.get('/:id', protect, getDonorById);
router.put('/:id/vitals', protect, updateDonorVitals);
router.put('/:id/eligibility-override', protect, authorize('admin'), overrideEligibility);

module.exports = router;
