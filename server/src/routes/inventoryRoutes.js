const express = require('express');
const router = express.Router();
const {
  getInventory,
  getStockSummary,
  searchAvailableBlood,
  discardBloodUnit,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/summary', getStockSummary);
router.get('/search', searchAvailableBlood);
router.get('/', protect, authorize('admin'), getInventory);
router.put('/:id/discard', protect, authorize('admin'), discardBloodUnit);

module.exports = router;
