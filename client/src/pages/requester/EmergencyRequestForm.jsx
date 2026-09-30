import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { AlertTriangle, PlusCircle, CheckCircle2, AlertCircle, Building2, Calendar, FileText } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = [
  { value: 'WHOLE_BLOOD', label: 'Whole Blood (450 mL)' },
  { value: 'RED_BLOOD_CELLS', label: 'Packed Red Blood Cells - PRBC' },
  { value: 'PLATELETS', label: 'Platelet Concentrates - RDP' },
  { value: 'PLASMA', label: 'Fresh Frozen Plasma - FFP' },
];

export default function EmergencyRequestForm() {
  const [searchParams] = useSearchParams();
  const initialGroup = searchParams.get('bloodGroup') || 'O+';

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [bloodGroup, setBloodGroup] = useState(initialGroup);
  const [componentType, setComponentType] = useState('WHOLE_BLOOD');
  const [requiredQuantity, setRequiredQuantity] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [patientReference, setPatientReference] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');
  const [requiredDate, setRequiredDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchParams.get('bloodGroup')) {
      setBloodGroup(searchParams.get('bloodGroup'));
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/requests', {
        bloodGroup,
        componentType,
        requiredQuantity: Number(requiredQuantity),
        patientName,
        patientReference,
        urgency,
        requiredDate,
        reason,
        hospitalName: hospitalName || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/requester/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit emergency blood request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        title="Submit Emergency Blood Request"
        subtitle="Expedited hospital blood requisition to central blood bank priority dispatch"
      />

      <div className="page-wrapper">
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          {urgency === 'CRITICAL' && (
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '2px solid #f43f5e',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                animation: 'pulseGlow 1.5s infinite',
              }}
            >
              <AlertTriangle size={28} color="#e11d48" />
              <div>
                <strong style={{ color: '#9f1239' }}>CRITICAL PRIORITY SELECTED:</strong>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#be123c' }}>
                  This request will flash immediately at the top of the Admin & Transfusion Officer queue.
                </p>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <PlusCircle size={20} color="#dc2626" />
                Blood Requisition Order Form
              </h3>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1.25rem',
                }}
              >
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {success ? (
              <div
                style={{
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  padding: '2rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800' }}>
                  Emergency Request Successfully Logged!
                </h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Requisition for <strong>{requiredQuantity} unit(s) of {bloodGroup} {componentType.replace('_', ' ')}</strong>{' '}
                  has been entered into the central priority queue.
                </p>
                <p style={{ color: '#047857', fontSize: '0.82rem', marginTop: '6px' }}>
                  Redirecting to live order tracking...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Required Blood Group</label>
                    <select
                      className="form-control"
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Component</label>
                    <select
                      className="form-control"
                      value={componentType}
                      onChange={(e) => setComponentType(e.target.value)}
                    >
                      {COMPONENTS.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Units Required (Quantity)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      className="form-control"
                      value={requiredQuantity}
                      onChange={(e) => setRequiredQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Patient Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Balakrishnan K"
                      className="form-control"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Patient Hospital ID / MRN Ref</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. APO-EMG-8821"
                      className="form-control"
                      value={patientReference}
                      onChange={(e) => setPatientReference(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Urgency Classification</label>
                    <select
                      className="form-control"
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value)}
                      style={{
                        fontWeight: '700',
                        color: urgency === 'CRITICAL' ? '#dc2626' : urgency === 'URGENT' ? '#d97706' : '#0f172a',
                      }}
                    >
                      <option value="NORMAL">NORMAL (Scheduled Procedure / Routine)</option>
                      <option value="URGENT">URGENT (Immediate requirement within 24 hours)</option>
                      <option value="CRITICAL">CRITICAL (Active Hemorrhage / Life Threatening / OT)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Required By Date</label>
                    <input
                      type="date"
                      required
                      className="form-control"
                      value={requiredDate}
                      onChange={(e) => setRequiredDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinical Indication / Reason for Transfusion</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    required
                    placeholder="e.g. Emergency CABG heart surgery, traumatic vehicular hemorrhage, severe postpartum bleeding..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className={`btn ${urgency === 'CRITICAL' ? 'btn-danger' : 'btn-primary'} btn-lg`}
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  disabled={loading}
                >
                  <PlusCircle size={18} />
                  {loading ? 'Submitting...' : 'Transmit Emergency Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
