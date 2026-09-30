require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const { connectDB, closeDB } = require('../config/db');

const User = require('../models/User');
const Donor = require('../models/Donor');
const Appointment = require('../models/Appointment');
const BloodUnit = require('../models/BloodUnit');
const BloodTest = require('../models/BloodTest');
const BloodRequest = require('../models/BloodRequest');
const Transaction = require('../models/Transaction');

async function seedData(alreadyConnected = false) {
  try {
    if (!alreadyConnected && mongoose.connection.readyState !== 1) {
      console.log('[Seeder] Connecting to database...');
      await connectDB();
    }

    console.log('[Seeder] Clearing existing data collections...');
    await User.deleteMany({});
    await Donor.deleteMany({});
    await Appointment.deleteMany({});
    await BloodUnit.deleteMany({});
    await BloodTest.deleteMany({});
    await BloodRequest.deleteMany({});
    await Transaction.deleteMany({});

    console.log('[Seeder] Creating users (Admin, Donors, Hospitals)...');

    // 1. Admin User
    const adminUser = await User.create({
      name: 'Dr. Priyan R (Chief Medical Officer)',
      email: 'admin@bloodbank.org',
      password: 'Password@123',
      role: 'admin',
      phone: '+91 98765 43210',
      address: 'Easwari Medical Center, Ramapuram, Chennai',
      bloodGroup: 'O+',
    });

    // 2. Hospital / Requester Users
    const hospital1 = await User.create({
      name: 'Dr. Arvind Swamy',
      email: 'apollo@hospital.org',
      password: 'Password@123',
      role: 'requester',
      phone: '+91 91234 56780',
      hospitalName: 'Apollo Specialty Hospitals, Greams Road',
      address: '21 Greams Lane, Thousand Lights, Chennai',
      bloodGroup: 'UNKNOWN',
    });

    const hospital2 = await User.create({
      name: 'Dr. Malini Iyer',
      email: 'kauvery@hospital.org',
      password: 'Password@123',
      role: 'requester',
      phone: '+91 91234 56781',
      hospitalName: 'Kauvery Emergency Trauma Center',
      address: '199 Luz Church Rd, Mylapore, Chennai',
      bloodGroup: 'UNKNOWN',
    });

    // 3. Donor Users & Linked Donor Records
    const donorUsersData = [
      {
        name: 'Priyan R',
        email: 'priyan.donor@gmail.com',
        phone: '+91 98401 23456',
        bloodGroup: 'O+',
        dob: '2004-05-14',
        gender: 'MALE',
        weight: 68,
        hemoglobin: 14.8,
        pulse: 72,
        bp: '120/80',
        lastDonationDaysAgo: 110,
        totalDonations: 4,
        status: 'ELIGIBLE',
      },
      {
        name: 'Ananya Sharma',
        email: 'ananya.sharma@gmail.com',
        phone: '+91 98402 34567',
        bloodGroup: 'A+',
        dob: '2003-08-22',
        gender: 'FEMALE',
        weight: 56,
        hemoglobin: 13.2,
        pulse: 76,
        bp: '115/75',
        lastDonationDaysAgo: 140,
        totalDonations: 3,
        status: 'ELIGIBLE',
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@gmail.com',
        phone: '+91 98403 45678',
        bloodGroup: 'B+',
        dob: '2002-11-10',
        gender: 'MALE',
        weight: 74,
        hemoglobin: 15.1,
        pulse: 68,
        bp: '122/82',
        lastDonationDaysAgo: null,
        totalDonations: 1,
        status: 'ELIGIBLE',
      },
      {
        name: 'Karthik Subramanian',
        email: 'karthik.s@gmail.com',
        phone: '+91 98404 56789',
        bloodGroup: 'AB+',
        dob: '2003-02-18',
        gender: 'MALE',
        weight: 62,
        hemoglobin: 13.8,
        pulse: 74,
        bp: '118/78',
        lastDonationDaysAgo: 25, // Donated 25 days ago -> Ineligible!
        totalDonations: 2,
        status: 'INELIGIBLE',
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@gmail.com',
        phone: '+91 98405 67890',
        bloodGroup: 'O-',
        dob: '2001-09-30',
        gender: 'FEMALE',
        weight: 54,
        hemoglobin: 12.8,
        pulse: 78,
        bp: '110/70',
        lastDonationDaysAgo: 180,
        totalDonations: 5,
        status: 'ELIGIBLE',
      },
      {
        name: 'Vikram Ramesh',
        email: 'vikram.ramesh@gmail.com',
        phone: '+91 98406 78901',
        bloodGroup: 'A-',
        dob: '2002-04-12',
        gender: 'MALE',
        weight: 70,
        hemoglobin: 14.2,
        pulse: 70,
        bp: '125/80',
        lastDonationDaysAgo: null,
        totalDonations: 0,
        status: 'ELIGIBLE',
      },
      {
        name: 'Deepa Natarajan',
        email: 'deepa.n@gmail.com',
        phone: '+91 98407 89012',
        bloodGroup: 'B-',
        dob: '2004-01-05',
        gender: 'FEMALE',
        weight: 58,
        hemoglobin: 13.5,
        pulse: 75,
        bp: '116/76',
        lastDonationDaysAgo: 105,
        totalDonations: 2,
        status: 'ELIGIBLE',
      },
      {
        name: 'Arjun Kumar',
        email: 'arjun.kumar@gmail.com',
        phone: '+91 98408 90123',
        bloodGroup: 'AB-',
        dob: '2003-07-19',
        gender: 'MALE',
        weight: 66,
        hemoglobin: 14.5,
        pulse: 71,
        bp: '120/78',
        lastDonationDaysAgo: null,
        totalDonations: 1,
        status: 'ELIGIBLE',
      },
    ];

    const donorDocs = [];
    for (const d of donorUsersData) {
      const u = await User.create({
        name: d.name,
        email: d.email,
        password: 'Password@123',
        role: 'donor',
        phone: d.phone,
        address: 'Chennai, Tamil Nadu',
        bloodGroup: d.bloodGroup,
      });

      const lastDate = d.lastDonationDaysAgo
        ? new Date(Date.now() - d.lastDonationDaysAgo * 24 * 60 * 60 * 1000)
        : null;

      const donorRecord = await Donor.create({
        user: u._id,
        bloodGroup: d.bloodGroup,
        dateOfBirth: new Date(d.dob),
        gender: d.gender,
        weightKg: d.weight,
        hemoglobin: d.hemoglobin,
        pulseRate: d.pulse,
        bloodPressure: d.bp,
        lastDonationDate: lastDate,
        eligibilityStatus: d.status,
        eligibilityRemarks:
          d.status === 'ELIGIBLE'
            ? 'Meets all mandatory clinical and physiological criteria for donation.'
            : 'Ineligible: Minimum 90-day recovery window required since last donation.',
        totalDonations: d.totalDonations,
      });

      donorDocs.push({ user: u, donor: donorRecord });
    }

    console.log(`[Seeder] Created ${donorDocs.length} donors across all 8 blood groups.`);

    // 4. Create Blood Units across all blood groups
    console.log('[Seeder] Stocking blood inventory across all 8 blood groups...');
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const components = ['WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'];

    let unitCounter = 1001;

    // Create 2 AVAILABLE units for each blood group (different components)
    for (const bg of bloodGroups) {
      for (let i = 0; i < 2; i++) {
        const comp = components[i % components.length];
        const unitId = `BLD-2026-${unitCounter++}`;
        const collDate = new Date(Date.now() - (5 + i * 2) * 24 * 60 * 60 * 1000);
        const expDate = new Date(Date.now() + (25 + i * 5) * 24 * 60 * 60 * 1000);

        const donorRef = donorDocs.find((d) => d.donor.bloodGroup === bg)?.donor || donorDocs[0].donor;

        const unit = await BloodUnit.create({
          unitId,
          donor: donorRef._id,
          bloodGroup: bg,
          componentType: comp,
          quantity: 1,
          volumeMl: 450,
          collectionDate: collDate,
          expiryDate: expDate,
          testingStatus: 'PASSED',
          inventoryStatus: 'AVAILABLE',
          storageLocation: `Cold Vault A, Rack ${bg[0]}-0${i + 1}`,
        });

        // Test record
        const test = await BloodTest.create({
          bloodUnit: unit._id,
          unitId: unit.unitId,
          testedBy: adminUser._id,
          hiv: 'NEGATIVE',
          hepatitisB: 'NEGATIVE',
          hepatitisC: 'NEGATIVE',
          syphilis: 'NEGATIVE',
          malaria: 'NEGATIVE',
          overallStatus: 'PASSED',
          testDate: collDate,
          remarks: 'Clinical ELISA and NAT screening clear. Non-reactive for all markers.',
        });

        unit.testRecord = test._id;
        await unit.save();

        // Transaction log
        await Transaction.create({
          transactionType: 'TEST_PASS',
          bloodUnit: unit._id,
          unitId: unit.unitId,
          bloodGroup: unit.bloodGroup,
          componentType: unit.componentType,
          quantity: 1,
          performedBy: adminUser._id,
          performedByName: adminUser.name,
          notes: `Routine collection passed viral screening. Unit placed in Cold Vault A.`,
          timestamp: collDate,
        });
      }
    }

    // 5. Create 2 PENDING units (for lab demonstration live screening)
    console.log('[Seeder] Creating pending units for live testing demonstration...');
    const pendingUnitsData = [
      { bg: 'O+', comp: 'WHOLE_BLOOD', donor: donorDocs[0].donor },
      { bg: 'B+', comp: 'RED_BLOOD_CELLS', donor: donorDocs[2].donor },
    ];

    for (const item of pendingUnitsData) {
      const unitId = `BLD-2026-${unitCounter++}`;
      const collDate = new Date();
      const expDate = new Date(Date.now() + 35 * 24 * 60 * 60 * 1000);

      const unit = await BloodUnit.create({
        unitId,
        donor: item.donor._id,
        bloodGroup: item.bg,
        componentType: item.comp,
        quantity: 1,
        volumeMl: 450,
        collectionDate: collDate,
        expiryDate: expDate,
        testingStatus: 'PENDING',
        inventoryStatus: 'RESERVED',
        storageLocation: 'Quarantine Section Q-1 (Testing Pending)',
      });

      const test = await BloodTest.create({
        bloodUnit: unit._id,
        unitId: unit.unitId,
        testedBy: adminUser._id,
        hiv: 'PENDING',
        hepatitisB: 'PENDING',
        hepatitisC: 'PENDING',
        syphilis: 'PENDING',
        malaria: 'PENDING',
        overallStatus: 'PENDING',
        remarks: 'Sample queued for five-panel infectious disease screen.',
      });

      unit.testRecord = test._id;
      await unit.save();

      await Transaction.create({
        transactionType: 'COLLECTION',
        bloodUnit: unit._id,
        unitId: unit.unitId,
        bloodGroup: unit.bloodGroup,
        componentType: unit.componentType,
        quantity: 1,
        performedBy: adminUser._id,
        performedByName: adminUser.name,
        notes: `Unit collected and sent to quarantine awaiting lab validation.`,
        timestamp: collDate,
      });
    }

    // 6. Create 1 FAILED / DISCARDED unit (demonstrating safety protection)
    const failedUnitId = `BLD-2026-${unitCounter++}`;
    const failedUnit = await BloodUnit.create({
      unitId: failedUnitId,
      donor: donorDocs[1].donor._id,
      bloodGroup: 'A+',
      componentType: 'WHOLE_BLOOD',
      quantity: 1,
      volumeMl: 450,
      collectionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
      testingStatus: 'FAILED',
      inventoryStatus: 'DISCARDED',
      discardReason: 'Infectious pathogen detected: Hepatitis B Reactive',
      storageLocation: 'Biohazard Incineration Hold',
    });

    const failedTest = await BloodTest.create({
      bloodUnit: failedUnit._id,
      unitId: failedUnit.unitId,
      testedBy: adminUser._id,
      hiv: 'NEGATIVE',
      hepatitisB: 'POSITIVE',
      hepatitisC: 'NEGATIVE',
      syphilis: 'NEGATIVE',
      malaria: 'NEGATIVE',
      overallStatus: 'FAILED',
      testDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      remarks: 'HBsAg Reactive confirmed on repeat ELISA. Unit destroyed as per safety protocol.',
    });

    failedUnit.testRecord = failedTest._id;
    await failedUnit.save();

    await Transaction.create({
      transactionType: 'DISCARD',
      bloodUnit: failedUnit._id,
      unitId: failedUnit.unitId,
      bloodGroup: failedUnit.bloodGroup,
      componentType: failedUnit.componentType,
      quantity: 1,
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      notes: `Pathogen detected (Hepatitis B). Unit incinerated.`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    // 7. Create Appointments (Today & Upcoming)
    console.log('[Seeder] Creating donation appointments...');
    await Appointment.create({
      donor: donorDocs[0].donor._id,
      user: donorDocs[0].user._id,
      appointmentDate: new Date(),
      timeSlot: '10:00 AM - 11:00 AM',
      status: 'SCHEDULED',
      bloodBankLocation: 'Easwari Blood Transfusion Center, Chennai',
      notes: 'Donor requested post-donation health certificate.',
    });

    await Appointment.create({
      donor: donorDocs[4].donor._id, // Sneha (O-)
      user: donorDocs[4].user._id,
      appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timeSlot: '02:00 PM - 03:00 PM',
      status: 'SCHEDULED',
      bloodBankLocation: 'Easwari Blood Transfusion Center, Chennai',
      notes: 'Universal donor priority booking.',
    });

    // 8. Create Emergency Blood Requests
    console.log('[Seeder] Registering emergency requests with urgency levels...');
    // Request 1: Critical pending
    await BloodRequest.create({
      requester: hospital1._id,
      hospitalName: hospital1.hospitalName,
      bloodGroup: 'O+',
      componentType: 'WHOLE_BLOOD',
      requiredQuantity: 1,
      patientName: 'K. Balakrishnan',
      patientReference: 'MED-EMG-2026-8819',
      urgency: 'CRITICAL',
      requiredDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      reason: 'Emergency coronary artery bypass graft (CABG) active surgery.',
      status: 'PENDING',
    });

    // Request 2: Urgent pending
    await BloodRequest.create({
      requester: hospital2._id,
      hospitalName: hospital2.hospitalName,
      bloodGroup: 'B+',
      componentType: 'RED_BLOOD_CELLS',
      requiredQuantity: 1,
      patientName: 'R. Meenakshi',
      patientReference: 'TRM-89102',
      urgency: 'URGENT',
      requiredDate: new Date(Date.now() + 36 * 60 * 60 * 1000),
      reason: 'Severe hemorrhagic anemia secondary to road traffic accident.',
      status: 'PENDING',
    });

    // Request 3: Already Fulfilled request with allocated unit & transaction
    const issuedUnitId = `BLD-2026-${unitCounter++}`;
    const issuedUnit = await BloodUnit.create({
      unitId: issuedUnitId,
      donor: donorDocs[2].donor._id,
      bloodGroup: 'A+',
      componentType: 'WHOLE_BLOOD',
      quantity: 1,
      volumeMl: 450,
      collectionDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      testingStatus: 'PASSED',
      inventoryStatus: 'ISSUED',
      issuedToHospital: 'Apollo Specialty Hospitals, Greams Road',
      patientReference: 'S. Jayaraman (Ref: APO-9921)',
      storageLocation: 'Dispensed from Cold Vault A',
    });

    const fulfilledRequest = await BloodRequest.create({
      requester: hospital1._id,
      hospitalName: hospital1.hospitalName,
      bloodGroup: 'A+',
      componentType: 'WHOLE_BLOOD',
      requiredQuantity: 1,
      patientName: 'S. Jayaraman',
      patientReference: 'APO-9921',
      urgency: 'URGENT',
      requiredDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      reason: 'Orthopedic joint replacement surgery bleeding.',
      status: 'FULFILLED',
      allocatedUnits: [issuedUnit._id],
      allocatedUnitIds: [issuedUnit.unitId],
      processedBy: adminUser._id,
      processedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    issuedUnit.allocatedRequest = fulfilledRequest._id;
    await issuedUnit.save();

    await Transaction.create({
      transactionType: 'ISSUE',
      bloodUnit: issuedUnit._id,
      unitId: issuedUnit.unitId,
      bloodGroup: issuedUnit.bloodGroup,
      componentType: issuedUnit.componentType,
      quantity: 1,
      performedBy: adminUser._id,
      performedByName: adminUser.name,
      recipientHospital: hospital1.hospitalName,
      patientReference: `${fulfilledRequest.patientName} (Ref: ${fulfilledRequest.patientReference})`,
      bloodRequest: fulfilledRequest._id,
      notes: `Blood unit successfully issued and dispatched for emergency patient transfusion.`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    console.log('[Seeder] ==========================================');
    console.log('[Seeder] DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('[Seeder] ==========================================');
    console.log('[Seeder] Demo Credentials:');
    console.log('  -> Admin:     admin@bloodbank.org     / Password@123');
    console.log('  -> Donor:     priyan.donor@gmail.com  / Password@123');
    console.log('  -> Hospital:  apollo@hospital.org     / Password@123');
    console.log('[Seeder] ==========================================');

    if (require.main === module) {
      await closeDB();
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seeder] Seeding error:', error);
    if (require.main === module) {
      await closeDB();
      process.exit(1);
    }
  }
}

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
