const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    componentType: {
      type: String,
      enum: ['WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'],
      default: 'WHOLE_BLOOD',
      required: true,
    },
    requiredQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientReference: {
      type: String,
      required: true,
      trim: true,
    },
    urgency: {
      type: String,
      enum: ['NORMAL', 'URGENT', 'CRITICAL'],
      default: 'NORMAL',
      required: true,
    },
    requiredDate: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
      default: 'PENDING',
      required: true,
    },
    allocatedUnits: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BloodUnit',
      },
    ],
    allocatedUnitIds: [
      {
        type: String,
      },
    ],
    rejectionReason: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    processedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
