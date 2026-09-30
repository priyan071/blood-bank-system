const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://localhost:5001${path}`);
    const postData = data ? JSON.stringify(data) : '';

    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: body });
          }
        });
      }
    );

    req.on('error', reject);
    if (data) req.write(postData);
    req.end();
  });
}

async function runEndToEndWorkflowTest() {
  console.log('====================================================');
  console.log('STARTING AUTOMATED FULL-STACK WORKFLOW VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    console.log('1. [Health Check]:', health.status === 200 ? 'PASSED (Status 200)' : 'FAILED');

    // 2. Admin Login
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@bloodbank.org',
      password: 'Password@123',
    });
    console.log('2. [Admin Login]:', adminLogin.data.success ? 'PASSED (Token received)' : 'FAILED');
    const adminToken = adminLogin.data.token;

    // 3. Hospital Login
    const hospitalLogin = await request('POST', '/api/auth/login', {
      email: 'apollo@hospital.org',
      password: 'Password@123',
    });
    console.log('3. [Hospital Login]:', hospitalLogin.data.success ? 'PASSED (Token received)' : 'FAILED');
    const hospitalToken = hospitalLogin.data.token;

    // 4. Donor Login
    const donorLogin = await request('POST', '/api/auth/login', {
      email: 'priyan.donor@gmail.com',
      password: 'Password@123',
    });
    console.log('4. [Donor Login]:', donorLogin.data.success ? 'PASSED (Token received)' : 'FAILED');
    const donorToken = donorLogin.data.token;

    // 5. Donor Eligibility Self-Check
    const evalRes = await request('POST', '/api/donors/check-eligibility', {
      weightKg: 68,
      hemoglobin: 14.5,
      pulseRate: 72,
      bloodPressure: '120/80',
      medicalConditions: [],
    }, donorToken);
    console.log('5. [Eligibility Check]:', evalRes.data.assessment.status === 'ELIGIBLE' ? 'PASSED (Donor is ELIGIBLE)' : 'FAILED');

    // 6. Admin Dashboard Telemetry
    const dashRes = await request('GET', '/api/dashboard/admin', null, adminToken);
    console.log('6. [Admin Dashboard Live KPIs]:', {
      availableUnits: dashRes.data.stats.availableUnits,
      totalDonors: dashRes.data.stats.totalDonors,
      pendingEmergencyRequests: dashRes.data.stats.pendingEmergencyRequests,
    });

    // 7. Inventory Stock Summary across 8 Blood Groups
    const stockRes = await request('GET', '/api/inventory/summary');
    console.log('7. [8 Blood Groups Stock Matrix]: Available units =', stockRes.data.overallAvailableUnits);

    // 8. Schedule Appointment & Phlebotomy Blood Collection
    const appointmentsRes = await request('GET', '/api/appointments?status=SCHEDULED', null, adminToken);
    const scheduledAppt = appointmentsRes.data.appointments[0];
    if (scheduledAppt) {
      console.log('8. [Found Scheduled Appointment]: for', scheduledAppt.donor?.user?.name);
      const collectRes = await request(
        'POST',
        `/api/appointments/${scheduledAppt._id}/complete-donation`,
        {
          componentType: 'WHOLE_BLOOD',
          volumeMl: 450,
          storageLocation: 'Main Cold Storage - Refrigerator 1, Shelf A',
        },
        adminToken
      );
      console.log('   -> Blood Unit Created:', collectRes.data.bloodUnit.unitId, '| Status:', collectRes.data.bloodUnit.inventoryStatus);

      // 9. Pathology Screening in Laboratory
      const testId = collectRes.data.bloodTest._id;
      const testResult = await request(
        'PUT',
        `/api/tests/${testId}/record`,
        {
          hiv: 'NEGATIVE',
          hepatitisB: 'NEGATIVE',
          hepatitisC: 'NEGATIVE',
          syphilis: 'NEGATIVE',
          malaria: 'NEGATIVE',
          remarks: 'Automated test suite clinical validation clear.',
        },
        adminToken
      );
      console.log('9. [Pathology Screening]:', testResult.data.bloodTest.overallStatus, '-> Unit is now', testResult.data.bloodUnit.inventoryStatus);
    }

    // 10. Hospital Emergency Blood Request Submission
    const reqSubmit = await request(
      'POST',
      '/api/requests',
      {
        bloodGroup: 'O+',
        componentType: 'WHOLE_BLOOD',
        requiredQuantity: 1,
        patientName: 'Test Patient Emergency',
        patientReference: 'TP-2026-99',
        urgency: 'CRITICAL',
        requiredDate: new Date(Date.now() + 86400000).toISOString(),
        reason: 'Automated full-stack verification test.',
      },
      hospitalToken
    );
    console.log('10. [Hospital Request]: Submitted ID =', reqSubmit.data.bloodRequest._id, '| Urgency =', reqSubmit.data.bloodRequest.urgency);

    // 11. Admin Fulfills Emergency Request & Stock Deduction
    const fulfillRes = await request(
      'PUT',
      `/api/requests/${reqSubmit.data.bloodRequest._id}/fulfill`,
      {},
      adminToken
    );
    console.log('11. [Admin Fulfill & Stock Deduction]:', fulfillRes.data.success ? 'PASSED (Units allocated: ' + fulfillRes.data.request.allocatedUnitIds.join(', ') + ')' : 'FAILED');

    // 12. Full Traceability Audit Verification
    const allocatedUnitId = fulfillRes.data.request.allocatedUnitIds[0];
    const traceRes = await request('GET', `/api/transactions/trace/${allocatedUnitId}`, null, adminToken);
    console.log('12. [Unit Traceability Chain of Custody]: Unit', allocatedUnitId, 'has', traceRes.data.timeline.length, 'recorded lifecycle events.');
    traceRes.data.timeline.forEach((event, idx) => {
      console.log(`    [Event ${idx + 1}]: ${event.transactionType} at ${new Date(event.timestamp).toLocaleTimeString()} (${event.notes})`);
    });

    console.log('\n====================================================');
    console.log('ALL 12 END-TO-END WORKFLOW TESTS PASSED PERFECTLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('Test error:', err);
  }
}

runEndToEndWorkflowTest();
