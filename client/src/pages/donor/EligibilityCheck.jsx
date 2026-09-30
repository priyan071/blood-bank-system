import React, { useState } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import { ShieldCheck, CheckCircle2, AlertTriangle, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EligibilityCheck() {
  const [weightKg, setWeightKg] = useState(65);
  const [hemoglobin, setHemoglobin] = useState(14.0);
  const [pulseRate, setPulseRate] = useState(72);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [dateOfBirth, setDateOfBirth] = useState('2003-05-15');
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const conditionOptions = [
    'Recent Tattoo or Piercing (past 6 months)',
    'Currently taking Antibiotics',
    'History of Hepatitis / Jaundice',
    'Cardiovascular Disorder / Heart Condition',
    'Active Fever, Cold or Infection today',
    'Pregnancy or Lactation (past 6 months)',
  ];

  const handleCheckboxChange = (condition) => {
    if (medicalConditions.includes(condition)) {
      setMedicalConditions(medicalConditions.filter((c) => c !== condition));
    } else {
      setMedicalConditions([...medicalConditions, condition]);
    }
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/donors/check-eligibility', {
        weightKg: Number(weightKg),
        hemoglobin: Number(hemoglobin),
        pulseRate: Number(pulseRate),
        bloodPressure,
        dateOfBirth,
        medicalConditions,
      });
      setResult(res.data.assessment);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        title="Donor Clinical Eligibility Self-Check"
        subtitle="Evaluate your physiological parameters against standard WHO & Red Cross blood donation criteria"
      />

      <div className="page-wrapper">
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Stethoscope size={20} color="#dc2626" />
                Clinical Parameter Assessment
              </h3>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Quick 2-minute pre-donation questionnaire
              </span>
            </div>

            <form onSubmit={handleEvaluate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date of Birth (Must be 18–65 yrs)</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Body Weight in kg (Min 50 kg)</label>
                  <input
                    type="number"
                    required
                    min={35}
                    max={180}
                    className="form-control"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hemoglobin Level in g/dL (Min 12.5)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    className="form-control"
                    value={hemoglobin}
                    onChange={(e) => setHemoglobin(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pulse Rate in bpm (60–100 bpm)</label>
                  <input
                    type="number"
                    required
                    className="form-control"
                    value={pulseRate}
                    onChange={(e) => setPulseRate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Pressure (Systolic/Diastolic)</label>
                  <input
                    type="text"
                    required
                    placeholder="120/80"
                    className="form-control"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                  Medical Declaration & Temporary Deferrals:
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
                  {conditionOptions.map((c) => (
                    <label
                      key={c}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        padding: '0.5rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={medicalConditions.includes(c)}
                        onChange={() => handleCheckboxChange(c)}
                      />
                      <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={loading}
              >
                <ShieldCheck size={18} />
                {loading ? 'Evaluating Vitals...' : 'Assess My Eligibility Now'}
              </button>
            </form>

            {/* Assessment Result Panel */}
            {result && (
              <div
                style={{
                  marginTop: '2rem',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  backgroundColor: result.isEligible ? '#ecfdf5' : '#fff1f2',
                  border: `2px solid ${result.isEligible ? '#10b981' : '#f43f5e'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  {result.isEligible ? (
                    <CheckCircle2 size={32} color="#059669" />
                  ) : (
                    <AlertTriangle size={32} color="#dc2626" />
                  )}
                  <div>
                    <h3 style={{ margin: 0, color: result.isEligible ? '#065f46' : '#991b1b', fontSize: '1.25rem', fontWeight: '800' }}>
                      {result.isEligible ? 'YOU ARE ELIGIBLE TO DONATE BLOOD!' : 'CURRENTLY NOT ELIGIBLE FOR DONATION'}
                    </h3>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: result.isEligible ? '#047857' : '#be123c' }}>
                      {result.summary}
                    </p>
                  </div>
                </div>

                {result.reasons && result.reasons.length > 0 && (
                  <ul style={{ paddingLeft: '1.5rem', fontSize: '0.85rem', color: '#991b1b', margin: '0.5rem 0' }}>
                    {result.reasons.map((r, i) => (
                      <li key={i} style={{ marginBottom: '4px' }}>{r}</li>
                    ))}
                  </ul>
                )}

                {result.isEligible && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <Link to="/donor/book" className="btn btn-success">
                      Proceed to Book Appointment <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
