const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donor',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      enum: [
        '09:00 AM - 10:00 AM',
        '10:00 AM - 11:00 AM',
        '11:00 AM - 12:00 PM',
        '01:00 PM - 02:00 PM',
        '02:00 PM - 03:00 PM',
        '03:00 PM - 04:00 PM',
        '04:00 PM - 05:00 PM',
      ],
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'SCHEDULED',
    },
    bloodBankLocation: {
      type: String,
      default: 'Easwari Blood Transfusion & Research Center, Chennai',
    },
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
    },
    createdBloodUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodUnit',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
