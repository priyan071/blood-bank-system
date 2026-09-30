const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: [
        'COLLECTION',
        'TEST_PASS',
        'TEST_FAIL',
        'RESERVE',
        'ISSUE',
        'DISCARD',
        'EXPIRE',
      ],
      required: true,
    },
    bloodUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodUnit',
      required: true,
    },
    unitId: {
      type: String,
      required: true,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    componentType: {
      type: String,
      enum: ['WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performedByName: {
      type: String,
      default: 'System Admin',
    },
    recipientHospital: {
      type: String,
      default: '',
    },
    patientReference: {
      type: String,
      default: '',
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    notes: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', transactionSchema);
