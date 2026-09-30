const BloodUnit = require('../models/BloodUnit');
const { logTransaction } = require('../utils/auditLogger');

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const ALL_COMPONENTS = ['WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'];

// @desc    Get all blood units (Admin)
// @route   GET /api/inventory
// @access  Private (Admin)
exports.getInventory = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType,
      inventoryStatus,
      testingStatus,
      search,
    } = req.query;

    let query = {};

    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (componentType) query.componentType = componentType;
    if (inventoryStatus) query.inventoryStatus = inventoryStatus;
    if (testingStatus) query.testingStatus = testingStatus;
    if (search) {
      query.unitId = { $regex: search, $options: 'i' };
    }

    const units = await BloodUnit.find(query)
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('testRecord')
      .sort({ collectionDate: -1 });

    res.status(200).json({
      success: true,
      count: units.length,
      units,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get aggregated stock matrix for all 8 blood groups
// @route   GET /api/inventory/summary
// @access  Public / Private
exports.getStockSummary = async (req, res, next) => {
  try {
    // Check and update any expired units automatically
    const now = new Date();
    const expiredUnits = await BloodUnit.find({
      inventoryStatus: 'AVAILABLE',
      expiryDate: { $lt: now },
    });

    for (const unit of expiredUnits) {
      unit.inventoryStatus = 'EXPIRED';
      await unit.save();
      await logTransaction({
        transactionType: 'EXPIRE',
        bloodUnit: unit._id,
        unitId: unit.unitId,
        bloodGroup: unit.bloodGroup,
        componentType: unit.componentType,
        notes: `Unit automatically marked EXPIRED due to shelf-life exceeded.`,
      });
    }

    // Aggregation of available units by bloodGroup and component
    const summaryData = await BloodUnit.aggregate([
      { $match: { inventoryStatus: 'AVAILABLE', testingStatus: 'PASSED' } },
      {
        $group: {
          _id: {
            bloodGroup: '$bloodGroup',
            componentType: '$componentType',
          },
          count: { $sum: 1 },
          totalVolumeMl: { $sum: '$volumeMl' },
        },
      },
    ]);

    // Build complete 8-group matrix even if count is 0
    const matrix = {};
    ALL_BLOOD_GROUPS.forEach((bg) => {
      matrix[bg] = {
        totalUnits: 0,
        components: {
          WHOLE_BLOOD: 0,
          RED_BLOOD_CELLS: 0,
          PLATELETS: 0,
          PLASMA: 0,
        },
      };
    });

    let overallAvailableUnits = 0;

    summaryData.forEach((item) => {
      const bg = item._id.bloodGroup;
      const comp = item._id.componentType;
      if (matrix[bg]) {
        matrix[bg].totalUnits += item.count;
        matrix[bg].components[comp] = item.count;
        overallAvailableUnits += item.count;
      }
    });

    res.status(200).json({
      success: true,
      overallAvailableUnits,
      matrix,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search available blood units for hospitals/requesters
// @route   GET /api/inventory/search
// @access  Public / Private
exports.searchAvailableBlood = async (req, res, next) => {
  try {
    const { bloodGroup, componentType } = req.query;
    let query = {
      inventoryStatus: 'AVAILABLE',
      testingStatus: 'PASSED',
      expiryDate: { $gt: new Date() },
    };

    if (bloodGroup && bloodGroup !== 'ALL') {
      query.bloodGroup = bloodGroup;
    }
    if (componentType && componentType !== 'ALL') {
      query.componentType = componentType;
    }

    const units = await BloodUnit.find(query)
      .select('unitId bloodGroup componentType volumeMl collectionDate expiryDate storageLocation')
      .sort({ expiryDate: 1 }); // Oldest safe unit first (FIFO transfusion principle)

    res.status(200).json({
      success: true,
      availableCount: units.length,
      units,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manually discard a blood unit
// @route   PUT /api/inventory/:id/discard
// @access  Private (Admin)
exports.discardBloodUnit = async (req, res, next) => {
  try {
    const { reason = 'Clinical discarding protocol' } = req.body;
    const unit = await BloodUnit.findById(req.params.id);

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Blood unit not found',
      });
    }

    if (unit.inventoryStatus === 'ISSUED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot discard a unit that has already been issued to a patient.',
      });
    }

    unit.inventoryStatus = 'DISCARDED';
    unit.discardReason = reason;
    await unit.save();

    await logTransaction({
      transactionType: 'DISCARD',
      bloodUnit: unit._id,
      unitId: unit.unitId,
      bloodGroup: unit.bloodGroup,
      componentType: unit.componentType,
      performedBy: req.user._id,
      performedByName: req.user.name,
      notes: `Unit discarded. Reason: ${reason}`,
    });

    res.status(200).json({
      success: true,
      message: 'Blood unit marked as DISCARDED',
      unit,
    });
  } catch (err) {
    next(err);
  }
};
