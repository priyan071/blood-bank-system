import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import { Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';

const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '01:00 PM - 02:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
];

export default function BookAppointment() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState(minDate);
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[0]);
  const [bloodBankLocation, setBloodBankLocation] = useState(
    'Easwari Blood Transfusion & Research Center, Ramapuram, Chennai'
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleBooking = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/appointments', {
        appointmentDate,
        timeSlot,
        bloodBankLocation,
        notes,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/donor');
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar
        title="Schedule Donation Appointment"
        subtitle="Reserve a convenient time slot for voluntary blood collection"
      />

      <div className="page-wrapper">
        <div style={{ maxWidth: '650px', margin: '0 auto' }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={20} color="#dc2626" />
                Select Appointment Preferences
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
                <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#065f46' }}>
                  Appointment Confirmed!
                </h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                  Your donation visit on <strong>{appointmentDate}</strong> during{' '}
                  <strong>{timeSlot}</strong> has been scheduled.
                </p>
                <p style={{ color: '#047857', fontSize: '0.82rem', marginTop: '4px' }}>
                  Redirecting to your dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking}>
                <div className="form-group">
                  <label className="form-label">Preferred Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="form-control"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Available Time Slot</label>
                  <select
                    className="form-control"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Blood Bank Donation Center</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={bloodBankLocation}
                    onChange={(e) => setBloodBankLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Special Requests / Notes (Optional)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="e.g. Need post-donation certificate for college, first-time phlebotomy guidance"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div
                  style={{
                    padding: '0.85rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#92400e',
                    marginBottom: '1.25rem',
                  }}
                >
                  💡 <strong>Donor Preparation Tip:</strong> Please drink at least 500 mL of water before your appointment and consume a healthy light meal. Avoid fatty foods.
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={loading}
                >
                  <Calendar size={18} />
                  {loading ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
