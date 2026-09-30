const Donor = require('../models/Donor');
const BloodUnit = require('../models/BloodUnit');
const BloodTest = require('../models/BloodTest');
const BloodRequest = require('../models/BloodRequest');
const Appointment = require('../models/Appointment');
const Transaction = require('../models/Transaction');

const ALL_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// @desc    Get live metrics for Admin Dashboard
// @route   GET /api/dashboard/admin
// @access  Private (Admin)
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const totalDonors = await Donor.countDocuments();
    const eligibleDonors = await Donor.countDocuments({ eligibilityStatus: 'ELIGIBLE' });

    const availableUnits = await BloodUnit.countDocuments({
      inventoryStatus: 'AVAILABLE',
      testingStatus: 'PASSED',
    });

    const pendingTests = await BloodTest.countDocuments({ overallStatus: 'PENDING' });

    const pendingEmergencyRequests = await BloodRequest.countDocuments({
      status: 'PENDING',
    });

    const criticalRequests = await BloodRequest.countDocuments({
      status: 'PENDING',
      urgency: 'CRITICAL',
    });

    // Today's appointments
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: { $gte: todayStart, $lte: todayEnd },
    });

    // Blood group stock distribution
    const bloodGroupStock = await BloodUnit.aggregate([
      { $match: { inventoryStatus: 'AVAILABLE', testingStatus: 'PASSED' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    const bloodGroupMatrix = {};
    ALL_BLOOD_GROUPS.forEach((bg) => {
      bloodGroupMatrix[bg] = 0;
    });
    bloodGroupStock.forEach((item) => {
      bloodGroupMatrix[item._id] = item.count;
    });

    // Component stock distribution
    const componentStock = await BloodUnit.aggregate([
      { $match: { inventoryStatus: 'AVAILABLE', testingStatus: 'PASSED' } },
      { $group: { _id: '$componentType', count: { $sum: 1 } } },
    ]);

    // Recent 5 transactions
    const recentTransactions = await Transaction.find()
      .sort({ timestamp: -1 })
      .limit(6);

    // Recent critical emergency requests
    const urgentRequests = await BloodRequest.find({ status: 'PENDING' })
      .sort({ urgency: -1, createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalDonors,
        eligibleDonors,
        availableUnits,
        pendingTests,
        pendingEmergencyRequests,
        criticalRequests,
        todayAppointments,
      },
      bloodGroupMatrix,
      componentStock,
      recentTransactions,
      urgentRequests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Donor personal dashboard stats
// @route   GET /api/dashboard/donor
// @access  Private (Donor)
exports.getDonorDashboard = async (req, res, next) => {
  try {
    const donor = await Donor.findOne({ user: req.user.id });
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found',
      });
    }

    const appointments = await Appointment.find({ donor: donor._id }).sort({
      appointmentDate: -1,
    });

    const donatedUnits = await BloodUnit.find({ donor: donor._id }).sort({
      collectionDate: -1,
    });

    // Calculate days until next donation
    let daysUntilNextDonation = 0;
    if (donor.lastDonationDate) {
      const daysSince = Math.floor(
        (Date.now() - new Date(donor.lastDonationDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince < 90) {
        daysUntilNextDonation = 90 - daysSince;
      }
    }

    res.status(200).json({
      success: true,
      donor,
      daysUntilNextDonation,
      totalDonations: donor.totalDonations,
      upcomingAppointments: appointments.filter((a) => a.status === 'SCHEDULED'),
      pastAppointments: appointments.filter((a) => a.status !== 'SCHEDULED'),
      donatedUnits,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Hospital / Requester dashboard stats
// @route   GET /api/dashboard/requester
// @access  Private (Requester)
exports.getRequesterDashboard = async (req, res, next) => {
  try {
    const totalRequests = await BloodRequest.countDocuments({ requester: req.user.id });
    const pendingRequests = await BloodRequest.countDocuments({
      requester: req.user.id,
      status: 'PENDING',
    });
    const fulfilledRequests = await BloodRequest.countDocuments({
      requester: req.user.id,
      status: 'FULFILLED',
    });

    const recentRequests = await BloodRequest.find({ requester: req.user.id })
      .populate('allocatedUnits', 'unitId bloodGroup componentType')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalRequests,
        pendingRequests,
        fulfilledRequests,
      },
      recentRequests,
    });
  } catch (err) {
    next(err);
  }
};
