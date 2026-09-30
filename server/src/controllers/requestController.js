const BloodRequest = require('../models/BloodRequest');
const BloodUnit = require('../models/BloodUnit');
const { logTransaction } = require('../utils/auditLogger');

// @desc    Create emergency blood request (Hospital/Requester)
// @route   POST /api/requests
// @access  Private (Requester or Admin)
exports.createRequest = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      componentType = 'WHOLE_BLOOD',
      requiredQuantity,
      patientName,
      patientReference,
      urgency = 'NORMAL',
      requiredDate,
      reason,
      hospitalName,
    } = req.body;

    const assignedHospitalName =
      hospitalName || req.user.hospitalName || req.user.name || 'General Hospital';

    const bloodRequest = await BloodRequest.create({
      requester: req.user.id,
      hospitalName: assignedHospitalName,
      bloodGroup,
      componentType,
      requiredQuantity: Number(requiredQuantity),
      patientName,
      patientReference,
      urgency,
      requiredDate: new Date(requiredDate),
      reason,
      status: 'PENDING',
    });

    res.status(201).json({
      success: true,
      message: 'Emergency blood request registered successfully in priority queue',
      bloodRequest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get requester's own requests
// @route   GET /api/requests/my
// @access  Private (Requester)
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate storageLocation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all emergency requests (Admin)
// @route   GET /api/requests
// @access  Private (Admin)
exports.getAllRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup } = req.query;
    let query = {};

    if (status) query.status = status;
    if (urgency) query.urgency = urgency;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    let requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone hospitalName')
      .populate('allocatedUnits', 'unitId bloodGroup componentType expiryDate')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 });

    // Sort by urgency priority: CRITICAL -> URGENT -> NORMAL, then PENDING first
    const urgencyWeight = { CRITICAL: 3, URGENT: 2, NORMAL: 1 };
    requests = requests.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
      return (urgencyWeight[b.urgency] || 0) - (urgencyWeight[a.urgency] || 0);
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve emergency blood request (Verify stock and set to APPROVED)
// @route   PUT /api/requests/:id/approve
// @access  Private (Admin)
exports.approveRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency blood request not found',
      });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Request is already in '${request.status}' status.`,
      });
    }

    // Check available stock in database
    const availableCount = await BloodUnit.countDocuments({
      inventoryStatus: 'AVAILABLE',
      testingStatus: 'PASSED',
      bloodGroup: request.bloodGroup,
      componentType: request.componentType,
      expiryDate: { $gt: new Date() },
    });

    if (availableCount < request.requiredQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: Insufficient stock available. Required: ${request.requiredQuantity}, Available in cold vault: ${availableCount}.`,
      });
    }

    request.status = 'APPROVED';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: `Emergency request approved. Available stock (${availableCount} units) is ready for immediate issue.`,
      request,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve and fulfill blood request (Deduct stock, issue units, log transactions)
// @route   PUT /api/requests/:id/fulfill
// @access  Private (Admin)
exports.approveAndFulfillRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Emergency blood request not found',
      });
    }

    if (request.status === 'FULFILLED') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been fulfilled.',
      });
    }

    if (request.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot fulfill a rejected request.',
      });
    }

    const { manualUnitIds } = req.body;
    let unitsToAllocate = [];

    if (manualUnitIds && Array.isArray(manualUnitIds) && manualUnitIds.length > 0) {
      // Validate requested units manually selected by admin
      unitsToAllocate = await BloodUnit.find({
        _id: { $in: manualUnitIds },
        inventoryStatus: 'AVAILABLE',
        testingStatus: 'PASSED',
        bloodGroup: request.bloodGroup,
        componentType: request.componentType,
        expiryDate: { $gt: new Date() },
      });

      if (unitsToAllocate.length < request.requiredQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient valid matching units selected. Required: ${request.requiredQuantity}, valid available: ${unitsToAllocate.length}. Inventory cannot become negative.`,
        });
      }
    } else {
      // Auto FIFO allocation of safe available units
      unitsToAllocate = await BloodUnit.find({
        inventoryStatus: 'AVAILABLE',
        testingStatus: 'PASSED',
        bloodGroup: request.bloodGroup,
        componentType: request.componentType,
        expiryDate: { $gt: new Date() },
      })
        .sort({ expiryDate: 1 }) // First to expire allocated first
        .limit(request.requiredQuantity);

      if (unitsToAllocate.length < request.requiredQuantity) {
        return res.status(400).json({
          success: false,
          message: `Cannot fulfill request: Insufficient stock available for ${request.bloodGroup} ${request.componentType}. Required: ${request.requiredQuantity}, Available in inventory: ${unitsToAllocate.length}. Blood inventory cannot become negative.`,
        });
      }
    }

    // Allocate and update units
    const allocatedIds = [];
    const allocatedUnitCodes = [];

    for (const unit of unitsToAllocate) {
      unit.inventoryStatus = 'ISSUED';
      unit.allocatedRequest = request._id;
      unit.issuedToHospital = request.hospitalName;
      unit.patientReference = `${request.patientName} (${request.patientReference})`;
      await unit.save();

      allocatedIds.push(unit._id);
      allocatedUnitCodes.push(unit.unitId);

      // Log Traceability Transaction for EACH issued unit
      await logTransaction({
        transactionType: 'ISSUE',
        bloodUnit: unit._id,
        unitId: unit.unitId,
        bloodGroup: unit.bloodGroup,
        componentType: unit.componentType,
        quantity: 1,
        performedBy: req.user._id,
        performedByName: req.user.name,
        recipientHospital: request.hospitalName,
        patientReference: `${request.patientName} (Ref: ${request.patientReference})`,
        bloodRequest: request._id,
        notes: `Unit issued for ${request.urgency} emergency request. Patient: ${request.patientName}. Hospital: ${request.hospitalName}`,
      });
    }

    // Update request document
    request.status = 'FULFILLED';
    request.allocatedUnits = allocatedIds;
    request.allocatedUnitIds = allocatedUnitCodes;
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: `Emergency request fulfilled successfully. ${unitsToAllocate.length} units deducted from inventory and issued.`,
      request,
      allocatedUnits: unitsToAllocate,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reject emergency blood request
// @route   PUT /api/requests/:id/reject
// @access  Private (Admin)
exports.rejectRequest = async (req, res, next) => {
  try {
    const { rejectionReason = 'Cannot be fulfilled at this time' } = req.body;
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    if (request.status === 'FULFILLED') {
      return res.status(400).json({
        success: false,
        message: 'Cannot reject an already fulfilled request.',
      });
    }

    request.status = 'REJECTED';
    request.rejectionReason = rejectionReason;
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Request has been rejected',
      request,
    });
  } catch (err) {
    next(err);
  }
};
