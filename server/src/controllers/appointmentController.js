const Appointment = require('../models/Appointment');
const Donor = require('../models/Donor');
const BloodUnit = require('../models/BloodUnit');
const BloodTest = require('../models/BloodTest');
const { generateUnitId, calculateExpiryDate } = require('../utils/unitGenerator');
const { logTransaction } = require('../utils/auditLogger');
const { assessDonorEligibility } = require('../utils/eligibility');

// @desc    Create / book donation appointment
// @route   POST /api/appointments
// @access  Private (Donor or Admin)
exports.createAppointment = async (req, res, next) => {
  try {
    let donorId;

    if (req.user.role === 'donor') {
      const donor = await Donor.findOne({ user: req.user.id });
      if (!donor) {
        return res.status(400).json({
          success: false,
          message: 'Donor profile must be configured before booking an appointment.',
        });
      }
      donorId = donor._id;
    } else {
      donorId = req.body.donorId;
      if (!donorId) {
        return res.status(400).json({
          success: false,
          message: 'Donor ID is required to schedule an appointment.',
        });
      }
    }

    const { appointmentDate, timeSlot, notes, bloodBankLocation } = req.body;

    // Check if donor already has an active scheduled appointment
    const existing = await Appointment.findOne({
      donor: donorId,
      status: 'SCHEDULED',
      appointmentDate: { $gte: new Date() },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an upcoming scheduled appointment.',
      });
    }

    const appointment = await Appointment.create({
      donor: donorId,
      user: req.user.id,
      appointmentDate: new Date(appointmentDate),
      timeSlot,
      notes,
      bloodBankLocation: bloodBankLocation || undefined,
      status: 'SCHEDULED',
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      });

    res.status(201).json({
      success: true,
      message: 'Donation appointment scheduled successfully',
      appointment: populatedAppointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all appointments (Admin) or donor's own appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'donor') {
      const donor = await Donor.findOne({ user: req.user.id });
      if (!donor) {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
      query.donor = donor._id;
    } else {
      if (req.query.status) {
        query.status = req.query.status;
      }
      if (req.query.date) {
        const start = new Date(req.query.date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(req.query.date);
        end.setHours(23, 59, 59, 999);
        query.appointmentDate = { $gte: start, $lte: end };
      }
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: 'donor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate('createdBloodUnit')
      .sort({ appointmentDate: -1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status (Cancel, No-show)
// @route   PUT /api/appointments/:id/status
// @access  Private (Admin or Donor for cancel)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Role check: donor can only cancel their own
    if (req.user.role === 'donor') {
      const donor = await Donor.findOne({ user: req.user.id });
      if (!donor || appointment.donor.toString() !== donor._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this appointment',
        });
      }
      if (status !== 'CANCELLED') {
        return res.status(400).json({
          success: false,
          message: 'Donors can only cancel appointments',
        });
      }
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      appointment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark donation as completed and collect blood unit
// @route   POST /api/appointments/:id/complete-donation
// @access  Private (Admin)
exports.completeDonationAndCollect = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('donor');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been completed and blood collected.',
      });
    }

    const donor = await Donor.findById(appointment.donor._id);
    const {
      componentType = 'WHOLE_BLOOD',
      volumeMl = 450,
      storageLocation = 'Main Cold Storage - Refrigerator 1, Shelf A',
    } = req.body;

    const unitId = await generateUnitId();
    const collectionDate = new Date();
    const expiryDate = calculateExpiryDate(collectionDate, componentType);

    // 1. Create BloodUnit
    const bloodUnit = await BloodUnit.create({
      unitId,
      donor: donor._id,
      bloodGroup: donor.bloodGroup,
      componentType,
      volumeMl,
      collectionDate,
      expiryDate,
      testingStatus: 'PENDING',
      inventoryStatus: 'RESERVED', // Reserved until laboratory testing passes
      storageLocation,
    });

    // 2. Create BloodTest entry for screening
    const bloodTest = await BloodTest.create({
      bloodUnit: bloodUnit._id,
      unitId: bloodUnit.unitId,
      testedBy: req.user.id,
      hiv: 'PENDING',
      hepatitisB: 'PENDING',
      hepatitisC: 'PENDING',
      syphilis: 'PENDING',
      malaria: 'PENDING',
      overallStatus: 'PENDING',
    });

    // Link test to unit
    bloodUnit.testRecord = bloodTest._id;
    await bloodUnit.save();

    // 3. Update appointment
    appointment.status = 'COMPLETED';
    appointment.completedAt = collectionDate;
    appointment.createdBloodUnit = bloodUnit._id;
    await appointment.save();

    // 4. Update donor stats & eligibility (lastDonationDate = today -> inelligible for 90 days)
    donor.lastDonationDate = collectionDate;
    donor.totalDonations += 1;
    const assessment = assessDonorEligibility({
      dateOfBirth: donor.dateOfBirth,
      weightKg: donor.weightKg,
      hemoglobin: donor.hemoglobin,
      pulseRate: donor.pulseRate,
      bloodPressure: donor.bloodPressure,
      lastDonationDate: collectionDate,
      medicalConditions: donor.medicalConditions,
    });
    donor.eligibilityStatus = assessment.status;
    donor.eligibilityRemarks = assessment.summary;
    await donor.save();

    // 5. Log Traceability Transaction
    await logTransaction({
      transactionType: 'COLLECTION',
      bloodUnit: bloodUnit._id,
      unitId: bloodUnit.unitId,
      bloodGroup: bloodUnit.bloodGroup,
      componentType: bloodUnit.componentType,
      quantity: 1,
      performedBy: req.user._id,
      performedByName: req.user.name,
      notes: `Blood unit successfully collected from donor ${donor.bloodGroup} at ${appointment.bloodBankLocation}`,
    });

    res.status(201).json({
      success: true,
      message: 'Donation completed. Blood unit created and dispatched to testing laboratory.',
      bloodUnit,
      bloodTest,
      appointment,
    });
  } catch (err) {
    next(err);
  }
};
