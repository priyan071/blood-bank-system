import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import { Calendar, CheckCircle2, XCircle, Droplet, Clock, MapPin } from 'lucide-react';

export default function AppointmentsList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Collection Modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [componentType, setComponentType] = useState('WHOLE_BLOOD');
  const [volumeMl, setVolumeMl] = useState(450);
  const [storageLocation, setStorageLocation] = useState('Main Cold Storage - Refrigerator 1, Shelf A');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let url = '/appointments';
      if (filterStatus !== 'ALL') url += `?status=${filterStatus}`;
      const res = await api.get(url);
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterStatus]);

  const openCollectModal = (appt) => {
    setSelectedAppt(appt);
    setComponentType('WHOLE_BLOOD');
    setVolumeMl(450);
    setIsModalOpen(true);
  };

  const handleCollectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSubmitting(true);

    try {
      const res = await api.post(`/appointments/${selectedAppt._id}/complete-donation`, {
        componentType,
        volumeMl: Number(volumeMl),
        storageLocation,
      });

      setSuccessMessage(
        `Blood Unit ${res.data.bloodUnit.unitId} created and dispatched to laboratory testing queue.`
      );
      setIsModalOpen(false);
      fetchAppointments();
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/appointments/${id}/status`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <>
      <Navbar
        title="Donation Appointments & Blood Collection"
        subtitle="Schedule appointments and process phlebotomy blood unit creation"
      />

      <div className="page-wrapper">
        {successMessage && (
          <div
            style={{
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontWeight: '600',
            }}
          >
            <CheckCircle2 size={20} color="#10b981" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Filter Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Filter by Status:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Appointments</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Showing <strong>{appointments.length}</strong> appointments
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Scheduled Date & Slot</th>
                <th>Center / Location</th>
                <th>Notes / Instructions</th>
                <th>Status</th>
                <th>Created Unit</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading appointments...
                  </td>
                </tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No appointments found matching current filter.
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>
                        {a.donor?.user?.name || 'Registered Donor'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {a.donor?.user?.phone || a.donor?.user?.email}
                      </div>
                    </td>
                    <td>
                      <BloodGroupPill bloodGroup={a.donor?.bloodGroup} size="sm" />
                    </td>
                    <td>
                      <div style={{ fontWeight: '600' }}>
                        {new Date(a.appointmentDate).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {a.timeSlot}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.82rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#64748b" />
                        {a.bloodBankLocation}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {a.notes || 'Routine voluntary donation'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={a.status} />
                    </td>
                    <td>
                      {a.createdBloodUnit ? (
                        <span className="badge badge-issued" style={{ fontFamily: 'monospace', fontWeight: '700' }}>
                          {a.createdBloodUnit.unitId || a.createdBloodUnit}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Not collected yet</span>
                      )}
                    </td>
                    <td>
                      {a.status === 'SCHEDULED' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openCollectModal(a)}
                            title="Collect blood and generate Unit ID"
                          >
                            <Droplet size={14} />
                            Collect Blood
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleStatusChange(a._id, 'CANCELLED')}
                            title="Cancel appointment"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: '700' }}>
                          ✓ Finalized
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Blood Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Phlebotomy: Collect Blood & Issue Unit"
      >
        {selectedAppt && (
          <form onSubmit={handleCollectSubmit}>
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
            >
              <BloodGroupPill bloodGroup={selectedAppt.donor?.bloodGroup} size="lg" />
              <div>
                <h4 style={{ margin: 0, color: '#991b1b', fontSize: '1rem', fontWeight: '700' }}>
                  Donor: {selectedAppt.donor?.user?.name}
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#7f1d1d' }}>
                  Confirmed blood group: <strong>{selectedAppt.donor?.bloodGroup}</strong> | Appointment: {new Date(selectedAppt.appointmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Component Separation Type</label>
              <select
                className="form-control"
                value={componentType}
                onChange={(e) => setComponentType(e.target.value)}
              >
                <option value="WHOLE_BLOOD">Whole Blood (35 Days shelf life)</option>
                <option value="RED_BLOOD_CELLS">Packed Red Blood Cells - PRBC (42 Days)</option>
                <option value="PLATELETS">Platelet Concentrates - RDP (5 Days)</option>
                <option value="PLASMA">Fresh Frozen Plasma - FFP (365 Days)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Volume Collected (mL)</label>
              <input
                type="number"
                className="form-control"
                value={volumeMl}
                onChange={(e) => setVolumeMl(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cold Storage Location</label>
              <input
                type="text"
                className="form-control"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
              />
            </div>

            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
              ℹ️ <em>Upon collection, the unit status will be <strong>RESERVED</strong> and automatically forwarded to the Laboratory for compulsory 5-pathogen screening before becoming AVAILABLE.</em>
            </p>

            <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Generating Unit...' : 'Confirm Collection & Send to Lab'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
