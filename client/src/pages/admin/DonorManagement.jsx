import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import { Users, Search, Filter, Stethoscope, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function DonorManagement() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedEligibility, setSelectedEligibility] = useState('ALL');

  // Modal State
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState('ELIGIBLE');
  const [overrideRemarks, setOverrideRemarks] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      let url = `/donors?`;
      if (selectedGroup !== 'ALL') url += `bloodGroup=${encodeURIComponent(selectedGroup)}&`;
      if (selectedEligibility !== 'ALL') url += `eligibilityStatus=${selectedEligibility}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setDonors(res.data.donors || []);
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedEligibility]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  const openReviewModal = (donor) => {
    setSelectedDonor(donor);
    setOverrideStatus(donor.eligibilityStatus);
    setOverrideRemarks('');
    setIsModalOpen(true);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDonor) return;
    setModalLoading(true);

    try {
      await api.put(`/donors/${selectedDonor._id}/eligibility-override`, {
        eligibilityStatus: overrideStatus,
        eligibilityRemarks: overrideRemarks || 'Clinical verification passed by physician.',
      });
      setIsModalOpen(false);
      fetchDonors();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update eligibility status');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <Navbar
        title="Donor Management & Eligibility Registry"
        subtitle="Manage registered blood donors, monitor clinical vitals, and verify eligibility"
      />

      <div className="page-wrapper">
        {/* Filter / Search Bar */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }}
                />
                <input
                  type="text"
                  placeholder="Search donor by name, email, or phone..."
                  className="form-control"
                  style={{ paddingLeft: '38px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>Blood Group:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>Eligibility:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  value={selectedEligibility}
                  onChange={(e) => setSelectedEligibility(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ELIGIBLE">Eligible</option>
                  <option value="INELIGIBLE">Ineligible</option>
                  <option value="PENDING_CHECK">Pending Check</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Donors Data Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor Information</th>
                <th>Blood Group</th>
                <th>Age / Gender</th>
                <th>Vitals (Hb / Wt / BP)</th>
                <th>Donations</th>
                <th>Last Donated</th>
                <th>Eligibility</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading donor records...
                  </td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No matching donors found in registry.
                  </td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{d.user?.name || 'Anonymous Donor'}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{d.user?.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{d.user?.phone}</div>
                    </td>
                    <td>
                      <BloodGroupPill bloodGroup={d.bloodGroup} size="sm" />
                    </td>
                    <td>
                      <span style={{ fontWeight: '600' }}>{d.age || '—'} yrs</span>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.gender}</div>
                    </td>
                    <td>
                      <div>
                        <strong>Hb:</strong> {d.hemoglobin ? `${d.hemoglobin} g/dL` : '—'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Wt: {d.weightKg}kg | BP: {d.bloodPressure || '—'}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '700', color: '#dc2626' }}>{d.totalDonations}</span> times
                    </td>
                    <td>
                      {d.lastDonationDate
                        ? new Date(d.lastDonationDate).toLocaleDateString()
                        : <span style={{ color: '#94a3b8' }}>First-time donor</span>}
                    </td>
                    <td>
                      <StatusBadge status={d.eligibilityStatus} />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => openReviewModal(d)}
                      >
                        <Stethoscope size={14} />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review / Eligibility Override Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Clinical Review: ${selectedDonor?.user?.name || 'Donor'}`}
      >
        {selectedDonor && (
          <form onSubmit={handleOverrideSubmit}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div><strong>Blood Group:</strong> {selectedDonor.bloodGroup}</div>
                <div><strong>Age:</strong> {selectedDonor.age} years</div>
                <div><strong>Weight:</strong> {selectedDonor.weightKg} kg (min 50 kg)</div>
                <div><strong>Hemoglobin:</strong> {selectedDonor.hemoglobin} g/dL (min 12.5)</div>
                <div><strong>Blood Pressure:</strong> {selectedDonor.bloodPressure} mmHg</div>
                <div><strong>Pulse Rate:</strong> {selectedDonor.pulseRate} bpm</div>
              </div>
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <strong>Algorithm Assessment:</strong>
                <p style={{ color: selectedDonor.eligibilityStatus === 'ELIGIBLE' ? '#065f46' : '#991b1b', margin: '4px 0 0 0' }}>
                  {selectedDonor.eligibilityRemarks || 'No contraindications detected.'}
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Decision / Override Status</label>
              <select
                className="form-control"
                value={overrideStatus}
                onChange={(e) => setOverrideStatus(e.target.value)}
              >
                <option value="ELIGIBLE">ELIGIBLE (Approved to Donate)</option>
                <option value="INELIGIBLE">INELIGIBLE (Deferred / High Risk)</option>
                <option value="PENDING_CHECK">PENDING CHECK (Further Testing Required)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Remarks</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Enter clinical notes justifying approval or deferral..."
                value={overrideRemarks}
                onChange={(e) => setOverrideRemarks(e.target.value)}
              />
            </div>

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
                disabled={modalLoading}
              >
                {modalLoading ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
