const mongoose = require('mongoose');

const bloodTestSchema = new mongoose.Schema(
  {
    bloodUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodUnit',
      required: true,
      unique: true,
    },
    unitId: {
      type: String,
      required: true,
    },
    testedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    hiv: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'PENDING',
      required: true,
    },
    hepatitisB: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'PENDING',
      required: true,
    },
    hepatitisC: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'PENDING',
      required: true,
    },
    syphilis: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'PENDING',
      required: true,
    },
    malaria: {
      type: String,
      enum: ['NEGATIVE', 'POSITIVE', 'PENDING'],
      default: 'PENDING',
      required: true,
    },
    overallStatus: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED'],
      default: 'PENDING',
      required: true,
    },
    testDate: {
      type: Date,
      default: null,
    },
    labTechnician: {
      type: String,
      default: 'Senior Clinical Pathologist',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('BloodTest', bloodTestSchema);
