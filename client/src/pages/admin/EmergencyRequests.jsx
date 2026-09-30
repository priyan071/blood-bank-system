import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  Calendar,
  Clock,
  ShieldAlert,
  Droplet,
} from 'lucide-react';

export default function EmergencyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Fulfill Modal
  const [selectedReq, setSelectedReq] = useState(null);
  const [matchingUnits, setMatchingUnits] = useState([]);
  const [checkingStock, setCheckingStock] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('No compatible blood units available in cold inventory');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let url = '/requests';
      if (filterStatus !== 'ALL') url += `?status=${filterStatus}`;
      const res = await api.get(url);
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch emergency requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const openFulfillModal = async (req) => {
    setSelectedReq(req);
    setIsFulfillModalOpen(true);
    setCheckingStock(true);

    try {
      // Find matching available units
      const res = await api.get(
        `/inventory/search?bloodGroup=${encodeURIComponent(req.bloodGroup)}&componentType=${req.componentType}`
      );
      setMatchingUnits(res.data.units || []);
    } catch (err) {
      console.error('Failed to check inventory:', err);
    } finally {
      setCheckingStock(false);
    }
  };

  const handleFulfillSubmit = async () => {
    if (!selectedReq) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/requests/${selectedReq._id}/fulfill`, {});
      setSuccessMessage(
        `Emergency Request fulfilled! Blood units issued to ${selectedReq.hospitalName} for patient ${selectedReq.patientName}.`
      );
      setIsFulfillModalOpen(false);
      fetchRequests();
      setTimeout(() => setSuccessMessage(''), 7000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fulfill request');
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectModal = (req) => {
    setSelectedReq(req);
    setRejectionReason('Zero compatible inventory in cold vault');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setSubmitting(true);

    try {
      await api.put(`/requests/${selectedReq._id}/reject`, { rejectionReason });
      setIsRejectModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar
        title="Emergency Blood Requests Priority Queue"
        subtitle="Process urgent hospital transfusion requirements with real-time stock allocation"
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
                <option value="ALL">All Requests</option>
                <option value="PENDING">Pending Approval</option>
                <option value="FULFILLED">Fulfilled / Issued</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Total Requests in Queue: <strong>{requests.length}</strong>
            </div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Urgency</th>
                <th>Hospital / Requester</th>
                <th>Blood Group</th>
                <th>Component & Qty</th>
                <th>Patient Details</th>
                <th>Required Date</th>
                <th>Clinical Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading emergency requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No requests found matching current filter.
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr
                    key={r._id}
                    style={{
                      backgroundColor: r.status === 'PENDING' && r.urgency === 'CRITICAL' ? '#fff1f2' : 'transparent',
                    }}
                  >
                    <td>
                      <StatusBadge status={r.urgency} />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Building2 size={14} color="#64748b" />
                        {r.hospitalName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Dr: {r.requester?.name || 'Authorized Medical Officer'}
                      </div>
                    </td>
                    <td>
                      <BloodGroupPill bloodGroup={r.bloodGroup} size="sm" />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#dc2626' }}>
                        {r.requiredQuantity} Unit(s)
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {r.componentType.replace('_', ' ')}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{r.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                        Ref: {r.patientReference}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: '500' }}>
                        {new Date(r.requiredDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {r.reason}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => openFulfillModal(r)}
                          >
                            <Droplet size={14} />
                            Fulfill
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => openRejectModal(r)}
                          >
                            Reject
                          </button>
                        </div>
                      ) : r.status === 'FULFILLED' ? (
                        <div>
                          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>
                            ✓ Fulfilled
                          </span>
                          {r.allocatedUnitIds && r.allocatedUnitIds.length > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#2563eb', fontFamily: 'monospace' }}>
                              Units: {r.allocatedUnitIds.join(', ')}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: '#991b1b' }}>
                          ✕ Rejected: {r.rejectionReason}
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

      {/* Fulfill / Allocate Blood Modal */}
      <Modal
        isOpen={isFulfillModalOpen}
        onClose={() => setIsFulfillModalOpen(false)}
        title="Approve & Fulfill Emergency Blood Request"
      >
        {selectedReq && (
          <div>
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>
                    {selectedReq.hospitalName}
                  </h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Patient: <strong>{selectedReq.patientName}</strong> (Ref: {selectedReq.patientReference})
                  </p>
                </div>
                <StatusBadge status={selectedReq.urgency} />
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BloodGroupPill bloodGroup={selectedReq.bloodGroup} size="sm" />
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                  Requested: {selectedReq.requiredQuantity} Unit(s) of {selectedReq.componentType.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Inventory Check Telemetry */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h5 style={{ fontSize: '0.88rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Cold Vault Real-Time Stock Validation:
              </h5>

              {checkingStock ? (
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Querying available units...</p>
              ) : matchingUnits.length >= selectedReq.requiredQuantity ? (
                <div
                  style={{
                    backgroundColor: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    <span>Sufficient Stock Available ({matchingUnits.length} verified units available)</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.78rem', color: '#047857' }}>
                    System will automatically allocate earliest-expiring (FIFO) verified units to prevent negative inventory and ensure maximum patient safety.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <AlertTriangle size={18} color="#dc2626" />
                    <span>INSUFFICIENT STOCK!</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem' }}>
                    Required: <strong>{selectedReq.requiredQuantity}</strong>, Available in stock: <strong>{matchingUnits.length}</strong>. Inventory protection will not allow stock to become negative.
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsFulfillModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting || matchingUnits.length < selectedReq.requiredQuantity}
                onClick={handleFulfillSubmit}
              >
                {submitting ? 'Allocating & Deducting Stock...' : 'Confirm Issue & Deduct Inventory'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Emergency Blood Request"
      >
        {selectedReq && (
          <form onSubmit={handleRejectSubmit}>
            <div className="form-group">
              <label className="form-label">Clinical / Logistical Reason for Rejection</label>
              <textarea
                className="form-control"
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="modal-footer" style={{ padding: 0, marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
