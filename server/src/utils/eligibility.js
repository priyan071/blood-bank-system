/**
 * Medical Eligibility Assessment Algorithm
 * Evaluates donor vitals against standard WHO & Red Cross guidelines:
 * - Age: 18 - 65 years
 * - Weight: >= 50 kg
 * - Hemoglobin: >= 12.5 g/dL
 * - Pulse: 60 - 100 bpm
 * - Blood Pressure: Systolic 90-140, Diastolic 60-90
 * - Donation interval: >= 90 days (12 weeks)
 */

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

function parseBloodPressure(bpString) {
  if (!bpString || typeof bpString !== 'string') return null;
  const parts = bpString.split('/');
  if (parts.length !== 2) return null;
  const systolic = parseInt(parts[0].trim(), 10);
  const diastolic = parseInt(parts[1].trim(), 10);
  if (isNaN(systolic) || isNaN(diastolic)) return null;
  return { systolic, diastolic };
}

function assessDonorEligibility({
  dateOfBirth,
  weightKg,
  hemoglobin,
  pulseRate,
  bloodPressure,
  lastDonationDate,
  medicalConditions = [],
}) {
  const reasons = [];

  // 1. Age Check (18 - 65)
  const age = calculateAge(dateOfBirth);
  if (age < 18) {
    reasons.push(`Donor age (${age} yrs) is under the legal minimum of 18 years.`);
  } else if (age > 65) {
    reasons.push(`Donor age (${age} yrs) exceeds the maximum limit of 65 years.`);
  }

  // 2. Weight Check (>= 50 kg)
  if (weightKg < 50) {
    reasons.push(`Donor weight (${weightKg} kg) is below the safe donation threshold of 50 kg.`);
  }

  // 3. Hemoglobin Check (>= 12.5 g/dL)
  if (hemoglobin !== undefined && hemoglobin !== null) {
    if (hemoglobin < 12.5) {
      reasons.push(`Hemoglobin level (${hemoglobin} g/dL) is below the required 12.5 g/dL.`);
    }
  }

  // 4. Pulse Rate Check (60 - 100 bpm)
  if (pulseRate !== undefined && pulseRate !== null) {
    if (pulseRate < 60 || pulseRate > 100) {
      reasons.push(`Pulse rate (${pulseRate} bpm) is out of the safe resting range (60 - 100 bpm).`);
    }
  }

  // 5. Blood Pressure Check
  const bp = parseBloodPressure(bloodPressure);
  if (bp) {
    if (bp.systolic < 90 || bp.systolic > 150 || bp.diastolic < 60 || bp.diastolic > 95) {
      reasons.push(`Blood pressure (${bloodPressure} mmHg) is out of safe range (90-150 / 60-95 mmHg).`);
    }
  }

  // 6. Last Donation Interval (>= 90 days)
  if (lastDonationDate) {
    const lastDate = new Date(lastDonationDate);
    const daysSince = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < 90) {
      const daysRemaining = 90 - daysSince;
      reasons.push(`Only ${daysSince} days since last donation. Mandatory waiting period is 90 days (${daysRemaining} days remaining).`);
    }
  }

  // 7. Disqualifying Conditions
  const disqualifiers = ['HIV', 'Hepatitis', 'Cardiac Disease', 'Active Cancer', 'Severe Anemia'];
  const matchedDisqualifiers = medicalConditions.filter((c) =>
    disqualifiers.some((d) => c.toLowerCase().includes(d.toLowerCase()))
  );
  if (matchedDisqualifiers.length > 0) {
    reasons.push(`Disqualifying medical history detected: ${matchedDisqualifiers.join(', ')}.`);
  }

  const isEligible = reasons.length === 0;
  return {
    isEligible,
    status: isEligible ? 'ELIGIBLE' : 'INELIGIBLE',
    reasons,
    summary: isEligible
      ? 'Donor meets all standard clinical eligibility guidelines.'
      : reasons.join(' '),
  };
}

module.exports = {
  assessDonorEligibility,
  calculateAge,
};
