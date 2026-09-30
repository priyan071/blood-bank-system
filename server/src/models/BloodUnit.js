const mongoose = require('mongoose');

const bloodUnitSchema = new mongoose.Schema(
  {
    unitId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
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
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    volumeMl: {
      type: Number,
      default: 450,
    },
    collectionDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    testingStatus: {
      type: String,
      enum: ['PENDING', 'PASSED', 'FAILED'],
      default: 'PENDING',
      required: true,
    },
    inventoryStatus: {
      type: String,
      enum: ['AVAILABLE', 'RESERVED', 'ISSUED', 'EXPIRED', 'DISCARDED'],
      default: 'RESERVED',
      required: true,
    },
    storageLocation: {
      type: String,
      default: 'Main Cold Storage - Refrigerator 1, Shelf A',
    },
    testRecord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodTest',
    },
    allocatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
    },
    issuedToHospital: {
      type: String,
      default: '',
    },
    patientReference: {
      type: String,
      default: '',
    },
    discardReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Helpful virtual for days until expiry
bloodUnitSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const diffTime = this.expiryDate.getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

bloodUnitSchema.set('toJSON', { virtuals: true });
bloodUnitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BloodUnit', bloodUnitSchema);
