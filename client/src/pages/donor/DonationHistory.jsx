import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import { HeartHandshake, Award, CheckCircle2, Clock, Calendar, Droplet, Download } from 'lucide-react';

export default function DonationHistory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificateModal, setCertificateModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/donor');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openCertificate = (unit) => {
    setSelectedDonation(unit);
    setCertificateModal(true);
  };

  if (loading) {
    return (
      <>
        <Navbar title="Donation History" subtitle="Loading your records..." />
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b' }}>Retrieving personal donation history...</p>
        </div>
      </>
    );
  }

  const { donor, donatedUnits, pastAppointments } = data || {};

  return (
    <>
      <Navbar
        title="Donation History & Digital Certificates"
        subtitle="Review your voluntary blood donations, test outcomes, and community impact certificates"
      />

      <div className="page-wrapper">
        {/* Past Donated Units Table */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Droplet size={18} color="#dc2626" />
              Collected Blood Units & Laboratory Status
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Every unit donated undergoes rigorous pathology testing
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Volume</th>
                  <th>Collection Date</th>
                  <th>Screening Status</th>
                  <th>Inventory Status</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {donatedUnits && donatedUnits.length > 0 ? (
                  donatedUnits.map((unit) => (
                    <tr key={unit._id}>
                      <td>
                        <span style={{ fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>
                          {unit.unitId}
                        </span>
                      </td>
                      <td>
                        <BloodGroupPill bloodGroup={unit.bloodGroup} size="sm" />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {unit.componentType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{unit.volumeMl} mL</td>
                      <td>{new Date(unit.collectionDate).toLocaleDateString()}</td>
                      <td>
                        <StatusBadge status={unit.testingStatus} />
                      </td>
                      <td>
                        <StatusBadge status={unit.inventoryStatus} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => openCertificate(unit)}
                        >
                          <Award size={14} color="#dc2626" />
                          View Certificate
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No blood collections recorded yet. Complete an appointment to receive your first certificate!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Appointments */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} color="#dc2626" />
              Past Appointment Log
            </h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Center Location</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {pastAppointments && pastAppointments.length > 0 ? (
                  pastAppointments.map((a) => (
                    <tr key={a._id}>
                      <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                      <td>{a.timeSlot}</td>
                      <td>{a.bloodBankLocation}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td>{a.notes || '—'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No past appointments recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Digital Impact Certificate Modal */}
      <Modal
        isOpen={certificateModal}
        onClose={() => setCertificateModal(false)}
        title="Official Certificate of Appreciation"
        maxWidth="680px"
      >
        <div
          id="certificate-print"
          style={{
            border: '8px double #dc2626',
            borderRadius: '16px',
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: '#fffdfd',
            boxShadow: 'inset 0 0 20px rgba(220,38,38,0.05)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏅</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#991b1b', letterSpacing: '0.04em' }}>
            CERTIFICATE OF BLOOD DONATION
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '4px' }}>
            Easwari Blood Transfusion & Research Center
          </p>

          <div style={{ margin: '1.75rem 0', fontSize: '1rem', color: '#334155', lineHeight: 1.6 }}>
            This certificate is proudly awarded to:
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', margin: '0.5rem 0' }}>
              {donor?.user?.name || 'Priyan R'}
            </div>
            for selflessly donating <strong>1 Unit ({selectedDonation?.volumeMl || 450} mL)</strong> of{' '}
            <strong>{selectedDonation?.bloodGroup || donor?.bloodGroup} {selectedDonation?.componentType?.replace('_', ' ')}</strong>{' '}
            (Unit ID: <code style={{ color: '#dc2626', fontWeight: '700' }}>{selectedDonation?.unitId}</code>) on{' '}
            <strong>{selectedDonation ? new Date(selectedDonation.collectionDate).toLocaleDateString() : 'Today'}</strong>.
            <br />
            Your voluntary contribution will help save up to <strong>3 precious human lives</strong>.
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #fecaca' }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: '#0f172a' }}>Dr. Priyan R</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Medical Director & Clinical Pathologist</div>
            </div>
            <div
              style={{
                padding: '4px 12px',
                border: '2px solid #059669',
                borderRadius: '6px',
                color: '#059669',
                fontSize: '0.75rem',
                fontWeight: '800',
                textTransform: 'uppercase',
              }}
            >
              ✓ Medically Verified
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setCertificateModal(false)}
          >
            Close
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => window.print()}
          >
            <Download size={16} /> Print / Save Certificate
          </button>
        </div>
      </Modal>
    </>
  );
}
