const Donor = require('../models/Donor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const BloodUnit = require('../models/BloodUnit');
const { assessDonorEligibility } = require('../utils/eligibility');

// @desc    Get all registered donors (Admin)
// @route   GET /api/donors
// @access  Private (Admin)
exports.getAllDonors = async (req, res, next) => {
  try {
    const { bloodGroup, eligibilityStatus, search } = req.query;
    let query = {};

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (eligibilityStatus) {
      query.eligibilityStatus = eligibilityStatus;
    }

    let donors = await Donor.find(query)
      .populate('user', 'name email phone address')
      .sort({ createdAt: -1 });

    if (search) {
      const searchLower = search.toLowerCase();
      donors = donors.filter(
        (d) =>
          d.user?.name?.toLowerCase().includes(searchLower) ||
          d.user?.email?.toLowerCase().includes(searchLower) ||
          d.user?.phone?.includes(searchLower)
      );
    }

    res.status(200).json({
      success: true,
      count: donors.length,
      donors,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single donor details (Admin or Donor)
// @route   GET /api/donors/:id
// @access  Private
exports.getDonorById = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id).populate(
      'user',
      'name email phone address'
    );

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found',
      });
    }

    // Check ownership if not admin
    if (req.user.role === 'donor' && donor.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this donor profile',
      });
    }

    // Fetch donation history and appointments
    const appointments = await Appointment.find({ donor: donor._id }).sort({
      appointmentDate: -1,
    });
    const donatedUnits = await BloodUnit.find({ donor: donor._id }).sort({
      collectionDate: -1,
    });

    res.status(200).json({
      success: true,
      donor,
      appointments,
      donatedUnits,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update donor vitals and auto re-evaluate eligibility
// @route   PUT /api/donors/:id/vitals
// @access  Private (Admin or Donor)
exports.updateDonorVitals = async (req, res, next) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found',
      });
    }

    // Role check
    if (req.user.role === 'donor' && donor.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this donor vitals',
      });
    }

    const {
      weightKg,
      hemoglobin,
      pulseRate,
      bloodPressure,
      medicalConditions,
      dateOfBirth,
      bloodGroup,
    } = req.body;

    if (weightKg) donor.weightKg = weightKg;
    if (hemoglobin) donor.hemoglobin = hemoglobin;
    if (pulseRate) donor.pulseRate = pulseRate;
    if (bloodPressure) donor.bloodPressure = bloodPressure;
    if (medicalConditions) donor.medicalConditions = medicalConditions;
    if (dateOfBirth) donor.dateOfBirth = dateOfBirth;
    if (bloodGroup) donor.bloodGroup = bloodGroup;

    // Run clinical assessment
    const assessment = assessDonorEligibility({
      dateOfBirth: donor.dateOfBirth,
      weightKg: donor.weightKg,
      hemoglobin: donor.hemoglobin,
      pulseRate: donor.pulseRate,
      bloodPressure: donor.bloodPressure,
      lastDonationDate: donor.lastDonationDate,
      medicalConditions: donor.medicalConditions,
    });

    donor.eligibilityStatus = assessment.status;
    donor.eligibilityRemarks = assessment.summary;

    await donor.save();

    res.status(200).json({
      success: true,
      message: 'Vitals updated and eligibility re-assessed',
      donor,
      assessment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Self-check eligibility for logged in donor
// @route   POST /api/donors/check-eligibility
// @access  Private (Donor)
exports.checkMyEligibility = async (req, res, next) => {
  try {
    let donor = await Donor.findOne({ user: req.user.id });
    const {
      weightKg,
      hemoglobin,
      pulseRate,
      bloodPressure,
      dateOfBirth,
      medicalConditions,
    } = req.body;

    const assessment = assessDonorEligibility({
      dateOfBirth: dateOfBirth || donor?.dateOfBirth,
      weightKg: weightKg || donor?.weightKg,
      hemoglobin: hemoglobin || donor?.hemoglobin,
      pulseRate: pulseRate || donor?.pulseRate,
      bloodPressure: bloodPressure || donor?.bloodPressure,
      lastDonationDate: donor?.lastDonationDate,
      medicalConditions: medicalConditions || donor?.medicalConditions || [],
    });

    res.status(200).json({
      success: true,
      assessment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin manual override of eligibility
// @route   PUT /api/donors/:id/eligibility-override
// @access  Private (Admin)
exports.overrideEligibility = async (req, res, next) => {
  try {
    const { eligibilityStatus, eligibilityRemarks } = req.body;
    const donor = await Donor.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor record not found',
      });
    }

    donor.eligibilityStatus = eligibilityStatus;
    if (eligibilityRemarks) {
      donor.eligibilityRemarks = `[Admin Override by ${req.user.name}]: ${eligibilityRemarks}`;
    }

    await donor.save();

    res.status(200).json({
      success: true,
      message: 'Eligibility status successfully updated by admin',
      donor,
    });
  } catch (err) {
    next(err);
  }
};
