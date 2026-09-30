const BloodTest = require('../models/BloodTest');
const BloodUnit = require('../models/BloodUnit');
const { logTransaction } = require('../utils/auditLogger');

// @desc    Get all tests or pending screening queue
// @route   GET /api/tests
// @access  Private (Admin)
exports.getTests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};

    if (status) {
      query.overallStatus = status;
    }

    let tests = await BloodTest.find(query)
      .populate({
        path: 'bloodUnit',
        populate: { path: 'donor', populate: { path: 'user', select: 'name email' } },
      })
      .populate('testedBy', 'name email')
      .sort({ createdAt: -1 });

    if (search) {
      const s = search.toLowerCase();
      tests = tests.filter((t) => t.unitId.toLowerCase().includes(s));
    }

    res.status(200).json({
      success: true,
      count: tests.length,
      tests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single test details
// @route   GET /api/tests/:id
// @access  Private (Admin)
exports.getTestById = async (req, res, next) => {
  try {
    const test = await BloodTest.findById(req.params.id)
      .populate({
        path: 'bloodUnit',
        populate: { path: 'donor', populate: { path: 'user', select: 'name email' } },
      })
      .populate('testedBy', 'name email');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Blood test record not found',
      });
    }

    res.status(200).json({
      success: true,
      test,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Record laboratory screening results
// @route   PUT /api/tests/:id/record
// @access  Private (Admin)
exports.recordTestResult = async (req, res, next) => {
  try {
    const {
      hiv = 'NEGATIVE',
      hepatitisB = 'NEGATIVE',
      hepatitisC = 'NEGATIVE',
      syphilis = 'NEGATIVE',
      malaria = 'NEGATIVE',
      labTechnician = 'Senior Clinical Pathologist',
      remarks = '',
    } = req.body;

    const bloodTest = await BloodTest.findById(req.params.id);
    if (!bloodTest) {
      return res.status(404).json({
        success: false,
        message: 'Blood test record not found',
      });
    }

    const bloodUnit = await BloodUnit.findById(bloodTest.bloodUnit);
    if (!bloodUnit) {
      return res.status(404).json({
        success: false,
        message: 'Associated blood unit not found',
      });
    }

    // Determine overall result
    const pathogens = [hiv, hepatitisB, hepatitisC, syphilis, malaria];
    const isFailed = pathogens.some((result) => result === 'POSITIVE');
    const overallStatus = isFailed ? 'FAILED' : 'PASSED';

    bloodTest.hiv = hiv;
    bloodTest.hepatitisB = hepatitisB;
    bloodTest.hepatitisC = hepatitisC;
    bloodTest.syphilis = syphilis;
    bloodTest.malaria = malaria;
    bloodTest.overallStatus = overallStatus;
    bloodTest.testedBy = req.user.id;
    bloodTest.testDate = new Date();
    bloodTest.labTechnician = labTechnician;
    bloodTest.remarks = remarks;
    await bloodTest.save();

    // Update BloodUnit inventory status based on test result
    if (overallStatus === 'PASSED') {
      bloodUnit.testingStatus = 'PASSED';
      bloodUnit.inventoryStatus = 'AVAILABLE'; // Unit is now safe for patients and available in stock
      await bloodUnit.save();

      // Log transaction
      await logTransaction({
        transactionType: 'TEST_PASS',
        bloodUnit: bloodUnit._id,
        unitId: bloodUnit.unitId,
        bloodGroup: bloodUnit.bloodGroup,
        componentType: bloodUnit.componentType,
        performedBy: req.user._id,
        performedByName: req.user.name,
        notes: `Lab screening PASSED all viral markers (HIV, HBV, HCV, Syphilis, Malaria). Blood unit is now AVAILABLE.`,
      });
    } else {
      const positivePathogens = [];
      if (hiv === 'POSITIVE') positivePathogens.push('HIV');
      if (hepatitisB === 'POSITIVE') positivePathogens.push('Hepatitis B');
      if (hepatitisC === 'POSITIVE') positivePathogens.push('Hepatitis C');
      if (syphilis === 'POSITIVE') positivePathogens.push('Syphilis');
      if (malaria === 'POSITIVE') positivePathogens.push('Malaria');

      bloodUnit.testingStatus = 'FAILED';
      bloodUnit.inventoryStatus = 'DISCARDED'; // FAILED unit must never become available!
      bloodUnit.discardReason = `Infectious pathogen detected: ${positivePathogens.join(', ')}`;
      await bloodUnit.save();

      // Log transaction
      await logTransaction({
        transactionType: 'TEST_FAIL',
        bloodUnit: bloodUnit._id,
        unitId: bloodUnit.unitId,
        bloodGroup: bloodUnit.bloodGroup,
        componentType: bloodUnit.componentType,
        performedBy: req.user._id,
        performedByName: req.user.name,
        notes: `Screening FAILED. Pathogen detected: ${positivePathogens.join(', ')}. Unit marked as DISCARDED.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Screening recorded. Blood unit status updated to ${bloodUnit.inventoryStatus}.`,
      bloodTest,
      bloodUnit,
    });
  } catch (err) {
    next(err);
  }
};
