const BloodUnit = require('../models/BloodUnit');
const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const Transaction = require('../models/Transaction');

// @desc    Generate comprehensive system report data
// @route   GET /api/reports/summary
// @access  Private (Admin)
exports.getReportSummary = async (req, res, next) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const totalUnitsCollected = await BloodUnit.countDocuments();
    const availableUnits = await BloodUnit.countDocuments({
      inventoryStatus: 'AVAILABLE',
      testingStatus: 'PASSED',
    });
    const issuedUnits = await BloodUnit.countDocuments({ inventoryStatus: 'ISSUED' });
    const discardedUnits = await BloodUnit.countDocuments({ inventoryStatus: 'DISCARDED' });
    const expiredUnits = await BloodUnit.countDocuments({ inventoryStatus: 'EXPIRED' });

    const totalRequests = await BloodRequest.countDocuments();
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'FULFILLED' });
    const rejectedRequests = await BloodRequest.countDocuments({ status: 'REJECTED' });
    const pendingRequests = await BloodRequest.countDocuments({ status: 'PENDING' });

    // Blood group inventory breakdown
    const stockByGroup = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          available: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$inventoryStatus', 'AVAILABLE'] }, { $eq: ['$testingStatus', 'PASSED'] }] },
                1,
                0,
              ],
            },
          },
          issued: {
            $sum: { $cond: [{ $eq: ['$inventoryStatus', 'ISSUED'] }, 1, 0] },
          },
          discarded: {
            $sum: { $cond: [{ $eq: ['$inventoryStatus', 'DISCARDED'] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Component breakdown
    const componentBreakdown = await BloodUnit.aggregate([
      {
        $group: {
          _id: '$componentType',
          count: { $sum: 1 },
          available: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$inventoryStatus', 'AVAILABLE'] }, { $eq: ['$testingStatus', 'PASSED'] }] },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const fulfillmentRate = totalRequests > 0
      ? Math.round((fulfilledRequests / totalRequests) * 100)
      : 100;

    res.status(200).json({
      success: true,
      reportDate: new Date(),
      generatedBy: req.user.name,
      metrics: {
        totalDonors,
        totalUnitsCollected,
        availableUnits,
        issuedUnits,
        discardedUnits,
        expiredUnits,
        totalRequests,
        fulfilledRequests,
        rejectedRequests,
        pendingRequests,
        fulfillmentRate,
      },
      stockByGroup,
      componentBreakdown,
    });
  } catch (err) {
    next(err);
  }
};
