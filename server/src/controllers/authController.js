const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Donor = require('../models/Donor');
const { assessDonorEligibility } = require('../utils/eligibility');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_blood_bank_key_2026_jwt_token_auth', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'donor',
      phone,
      address,
      bloodGroup = 'O+',
      hospitalName,
      // Optional initial donor vitals
      dateOfBirth,
      gender = 'MALE',
      weightKg = 65,
      hemoglobin = 13.5,
      pulseRate = 72,
      bloodPressure = '120/80',
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone,
      address,
      bloodGroup: role === 'donor' ? bloodGroup : undefined,
      hospitalName: role === 'requester' ? hospitalName : undefined,
    });

    // If registering as a donor, create linked Donor profile
    if (role === 'donor') {
      const dob = dateOfBirth ? new Date(dateOfBirth) : new Date(Date.now() - 25 * 365 * 24 * 60 * 60 * 1000);
      const assessment = assessDonorEligibility({
        dateOfBirth: dob,
        weightKg,
        hemoglobin,
        pulseRate,
        bloodPressure,
        lastDonationDate: null,
      });

      await Donor.create({
        user: user._id,
        bloodGroup,
        dateOfBirth: dob,
        gender,
        weightKg,
        hemoglobin,
        pulseRate,
        bloodPressure,
        eligibilityStatus: assessment.status,
        eligibilityRemarks: assessment.summary,
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        hospitalName: user.hospitalName,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await Donor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bloodGroup: user.bloodGroup,
        hospitalName: user.hospitalName,
        donorProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let donorProfile = null;
    if (user.role === 'donor') {
      donorProfile = await Donor.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bloodGroup: user.bloodGroup,
        hospitalName: user.hospitalName,
        donorProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      hospitalName: req.body.hospitalName,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    next(err);
  }
};
