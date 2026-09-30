import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import { FlaskConical, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';

export default function BloodTestingLab() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [search, setSearch] = useState('');

  // Screening Modal
  const [selectedTest, setSelectedTest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hiv, setHiv] = useState('NEGATIVE');
  const [hepatitisB, setHepatitisB] = useState('NEGATIVE');
  const [hepatitisC, setHepatitisC] = useState('NEGATIVE');
  const [syphilis, setSyphilis] = useState('NEGATIVE');
  const [malaria, setMalaria] = useState('NEGATIVE');
  const [labTechnician, setLabTechnician] = useState('Dr. Priyan R (Clinical Pathologist)');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchTests = async () => {
    try {
      setLoading(true);
      let url = '/tests?';
      if (filterStatus !== 'ALL') url += `status=${filterStatus}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      setTests(res.data.tests || []);
    } catch (err) {
      console.error('Failed to fetch tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTests();
  };

  const openScreeningModal = (test) => {
    setSelectedTest(test);
    setHiv('NEGATIVE');
    setHepatitisB('NEGATIVE');
    setHepatitisC('NEGATIVE');
    setSyphilis('NEGATIVE');
    setMalaria('NEGATIVE');
    setRemarks('All viral and parasitic markers non-reactive via chemiluminescence.');
    setIsModalOpen(true);
  };

  const isAnyPositive =
    hiv === 'POSITIVE' ||
    hepatitisB === 'POSITIVE' ||
    hepatitisC === 'POSITIVE' ||
    syphilis === 'POSITIVE' ||
    malaria === 'POSITIVE';

  const handleScreeningSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTest) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/tests/${selectedTest._id}/record`, {
        hiv,
        hepatitisB,
        hepatitisC,
        syphilis,
        malaria,
        labTechnician,
        remarks,
      });

      setSuccessMessage(
        `Screening registered: Unit ${selectedTest.unitId} is now marked as ${res.data.bloodUnit.inventoryStatus}.`
      );
      setIsModalOpen(false);
      fetchTests();
      setTimeout(() => setSuccessMessage(''), 6000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record test result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar
        title="Pathology & Blood Testing Laboratory"
        subtitle="Mandatory 5-pathogen screening: HIV, Hepatitis B/C, Syphilis, and Malaria"
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
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
              <input
                type="text"
                placeholder="Search by Blood Unit ID (e.g. BLD-2026)..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Filter
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>Screening Status:</span>
              <select
                className="form-control"
                style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Tests</option>
                <option value="PENDING">Pending Screening Queue</option>
                <option value="PASSED">Passed (Safe & Available)</option>
                <option value="FAILED">Failed (Discarded)</option>
              </select>
            </div>
          </form>
        </div>

        {/* Tests Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Blood Group</th>
                <th>Component</th>
                <th>Collection Date</th>
                <th>HIV</th>
                <th>Hep B</th>
                <th>Hep C</th>
                <th>Syphilis</th>
                <th>Malaria</th>
                <th>Overall Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading laboratory tests...
                  </td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No tests found matching criteria.
                  </td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span style={{ fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>
                        {t.unitId}
                      </span>
                    </td>
                    <td>
                      <BloodGroupPill bloodGroup={t.bloodUnit?.bloodGroup} size="sm" />
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                        {t.bloodUnit?.componentType?.replace('_', ' ') || 'WHOLE BLOOD'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {t.bloodUnit?.collectionDate
                          ? new Date(t.bloodUnit.collectionDate).toLocaleDateString()
                          : '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={t.hiv} /></td>
                    <td><StatusBadge status={t.hepatitisB} /></td>
                    <td><StatusBadge status={t.hepatitisC} /></td>
                    <td><StatusBadge status={t.syphilis} /></td>
                    <td><StatusBadge status={t.malaria} /></td>
                    <td><StatusBadge status={t.overallStatus} /></td>
                    <td>
                      {t.overallStatus === 'PENDING' ? (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => openScreeningModal(t)}
                        >
                          <FlaskConical size={14} />
                          Record Results
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                          Verified: {t.testDate ? new Date(t.testDate).toLocaleDateString() : 'Yes'}
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

      {/* Lab Screening Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Pathology Screening: Unit ${selectedTest?.unitId}`}
        maxWidth="650px"
      >
        {selectedTest && (
          <form onSubmit={handleScreeningSubmit}>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>Unit ID & Group:</div>
                <div style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0f172a' }}>
                  {selectedTest.unitId} ({selectedTest.bloodUnit?.bloodGroup})
                </div>
              </div>
              <BloodGroupPill bloodGroup={selectedTest.bloodUnit?.bloodGroup} size="md" />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.75rem' }}>
                Screening Panel (ELISA / NAT Rapid Assay)
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>HIV 1 & 2 Antibody</label>
                  <select
                    className="form-control"
                    value={hiv}
                    onChange={(e) => setHiv(e.target.value)}
                  >
                    <option value="NEGATIVE">NEGATIVE (Non-Reactive)</option>
                    <option value="POSITIVE">POSITIVE (Reactive - Contaminated)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Hepatitis B (HBsAg)</label>
                  <select
                    className="form-control"
                    value={hepatitisB}
                    onChange={(e) => setHepatitisB(e.target.value)}
                  >
                    <option value="NEGATIVE">NEGATIVE (Non-Reactive)</option>
                    <option value="POSITIVE">POSITIVE (Reactive - Contaminated)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Hepatitis C (HCV)</label>
                  <select
                    className="form-control"
                    value={hepatitisC}
                    onChange={(e) => setHepatitisC(e.target.value)}
                  >
                    <option value="NEGATIVE">NEGATIVE (Non-Reactive)</option>
                    <option value="POSITIVE">POSITIVE (Reactive - Contaminated)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Syphilis (VDRL / RPR)</label>
                  <select
                    className="form-control"
                    value={syphilis}
                    onChange={(e) => setSyphilis(e.target.value)}
                  >
                    <option value="NEGATIVE">NEGATIVE (Non-Reactive)</option>
                    <option value="POSITIVE">POSITIVE (Reactive - Contaminated)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0, gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: '600' }}>Malaria Parasite (Smear)</label>
                  <select
                    className="form-control"
                    value={malaria}
                    onChange={(e) => setMalaria(e.target.value)}
                  >
                    <option value="NEGATIVE">NEGATIVE (Not Detected)</option>
                    <option value="POSITIVE">POSITIVE (Detected - Contaminated)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Live Verdict Banner */}
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                backgroundColor: isAnyPositive ? '#fef2f2' : '#ecfdf5',
                border: `1px solid ${isAnyPositive ? '#fecaca' : '#a7f3d0'}`,
                color: isAnyPositive ? '#991b1b' : '#065f46',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                fontWeight: '600',
                fontSize: '0.88rem',
              }}
            >
              {isAnyPositive ? (
                <>
                  <AlertTriangle size={20} color="#dc2626" />
                  <span>
                    VERDICT: <strong>FAILED</strong>. Blood unit will be IMMEDIATELY DISCARDED and marked biohazard. It will NEVER become available for transfusion.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} color="#10b981" />
                  <span>
                    VERDICT: <strong>PASSED</strong>. All 5 infectious markers clear. Blood unit will be transitioned to <strong>AVAILABLE</strong> in cold storage inventory.
                  </span>
                </>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Remarks / Batch Notes</label>
              <textarea
                className="form-control"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
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
                className={`btn ${isAnyPositive ? 'btn-danger' : 'btn-primary'}`}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : isAnyPositive ? 'Discard Contaminated Unit' : 'Confirm & Mark AVAILABLE'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
