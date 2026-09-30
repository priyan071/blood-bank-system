const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'MALE',
    },
    weightKg: {
      type: Number,
      required: true,
      min: 30,
      max: 200,
    },
    hemoglobin: {
      type: Number,
      min: 5,
      max: 20,
      default: 13.0,
    },
    pulseRate: {
      type: Number,
      min: 40,
      max: 160,
      default: 72,
    },
    bloodPressure: {
      type: String,
      default: '120/80',
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    eligibilityStatus: {
      type: String,
      enum: ['ELIGIBLE', 'INELIGIBLE', 'PENDING_CHECK'],
      default: 'PENDING_CHECK',
    },
    eligibilityRemarks: {
      type: String,
      default: '',
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    totalDonations: {
      type: Number,
      default: 0,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for calculating age
donorSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

donorSchema.set('toJSON', { virtuals: true });
donorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Donor', donorSchema);
