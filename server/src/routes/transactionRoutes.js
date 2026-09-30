const express = require('express');
const router = express.Router();
const {
  getTransactions,
  traceUnit,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/', protect, authorize('admin'), getTransactions);
router.get('/trace/:unitId', protect, traceUnit);

module.exports = router;
