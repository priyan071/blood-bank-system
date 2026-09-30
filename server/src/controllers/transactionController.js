const Transaction = require('../models/Transaction');
const BloodUnit = require('../models/BloodUnit');

// @desc    Get transaction history / audit log (Admin)
// @route   GET /api/transactions
// @access  Private (Admin)
exports.getTransactions = async (req, res, next) => {
  try {
    const { transactionType, bloodGroup, search } = req.query;
    let query = {};

    if (transactionType) query.transactionType = transactionType;
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (search) {
      query.$or = [
        { unitId: { $regex: search, $options: 'i' } },
        { recipientHospital: { $regex: search, $options: 'i' } },
        { patientReference: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await Transaction.find(query)
      .populate('performedBy', 'name email role')
      .populate('bloodRequest')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Full lifecycle traceability for a single unit ID
// @route   GET /api/transactions/trace/:unitId
// @access  Private
exports.traceUnit = async (req, res, next) => {
  try {
    const { unitId } = req.params;

    const unit = await BloodUnit.findOne({ unitId: unitId.toUpperCase() })
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('testRecord')
      .populate('allocatedRequest');

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: `Blood unit '${unitId}' not found in registry.`,
      });
    }

    // Fetch all chronological lifecycle events
    const timeline = await Transaction.find({ unitId: unit.unitId })
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      unit,
      timeline,
    });
  } catch (err) {
    next(err);
  }
};
