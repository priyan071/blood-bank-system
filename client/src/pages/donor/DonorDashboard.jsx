import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import { Heart, Calendar, Clock, Award, ShieldCheck, ArrowRight, UserCheck, Droplet } from 'lucide-react';

export default function DonorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDonorData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/donor');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load donor dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonorData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar title="Donor Dashboard" subtitle="Loading your profile..." />
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b' }}>Loading donor medical profile...</p>
        </div>
      </>
    );
  }

  const { donor, daysUntilNextDonation, totalDonations, upcomingAppointments, pastAppointments } =
    data || {};

  const isEligible = donor?.eligibilityStatus === 'ELIGIBLE';

  return (
    <>
      <Navbar
        title="Donor Wellness & Donation Portal"
        subtitle="Manage your voluntary blood donations, track eligibility, and schedule visits"
      />

      <div className="page-wrapper">
        {/* Top Grid: Digital Donor Card & Eligibility Status */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Sleek Digital Donor ID Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #ef4444 100%)',
              color: 'white',
              borderRadius: '20px',
              padding: '1.75rem',
              boxShadow: '0 12px 30px -5px rgba(220, 38, 38, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: '220px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Watermark */}
            <div
              style={{
                position: 'absolute',
                right: '-20px',
                bottom: '-20px',
                fontSize: '120px',
                opacity: 0.12,
                pointerEvents: 'none',
              }}
            >
              🩸
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
                  Official Digital Donor ID
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: '800', color: 'white' }}>
                  {donor?.user?.name || 'Registered Blood Donor'}
                </h3>
              </div>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: 'white',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                }}
              >
                {donor?.bloodGroup || 'O+'}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.25)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>TOTAL DONATIONS</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>{totalDonations || 0}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>LIVES SAVED</span>
                <div style={{ fontSize: '1.15rem', fontWeight: '800' }}>{(totalDonations || 0) * 3}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>STATUS</span>
                <div style={{ fontSize: '0.95rem', fontWeight: '700' }}>
                  {isEligible ? 'ELIGIBLE' : 'DEFERRED'}
                </div>
              </div>
            </div>
          </div>

          {/* Eligibility & Quick Action Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="card-header" style={{ paddingBottom: '0.5rem' }}>
                <h4 className="card-title">
                  <ShieldCheck size={20} color={isEligible ? '#059669' : '#dc2626'} />
                  Donation Eligibility Status
                </h4>
                <StatusBadge status={donor?.eligibilityStatus} />
              </div>

              <p style={{ fontSize: '0.88rem', color: '#475569', marginTop: '0.5rem' }}>
                {donor?.eligibilityRemarks ||
                  (isEligible
                    ? 'You satisfy all physiological requirements to donate whole blood or platelets.'
                    : 'A mandatory waiting period is currently active.')}
              </p>

              {daysUntilNextDonation > 0 && (
                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '8px',
                    color: '#92400e',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <Clock size={16} />
                  <span>
                    Next eligible donation date in: <strong>{daysUntilNextDonation} days</strong>
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <Link to="/donor/book" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                <Calendar size={15} /> Book Appointment
              </Link>
              <Link to="/donor/eligibility" className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                Self-Assessment
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="#dc2626" />
              Your Upcoming Scheduled Appointments
            </h3>
            <Link to="/donor/book" className="btn btn-primary btn-sm">
              Schedule New Visit
            </Link>
          </div>

          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingAppointments.map((appt) => (
                <div
                  key={appt._id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem', color: '#0f172a' }}>
                      {new Date(appt.appointmentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#dc2626', marginTop: '2px' }}>
                      Time Slot: <strong>{appt.timeSlot}</strong>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                      Location: {appt.bloodBankLocation}
                    </div>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem' }}>
              No upcoming appointments booked. Book a time slot to donate blood!
            </p>
          )}
        </div>
      </div>
    </>
  );
}
