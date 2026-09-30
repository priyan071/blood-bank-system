import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import Modal from '../../components/Modal';
import { Database, Search, Trash2, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['ALL', 'WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'];

export default function BloodInventory() {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedComponent, setSelectedComponent] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Discard Modal
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [discardReason, setDiscardReason] = useState('Bag integrity compromised / Hemolysis');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      let url = '/inventory?';
      if (selectedGroup !== 'ALL') url += `bloodGroup=${encodeURIComponent(selectedGroup)}&`;
      if (selectedComponent !== 'ALL') url += `componentType=${selectedComponent}&`;
      if (selectedStatus !== 'ALL') url += `inventoryStatus=${selectedStatus}&`;
      if (search) url += `search=${encodeURIComponent(search)}`;

      const res = await api.get(url);
      setUnits(res.data.units || []);
    } catch (err) {
      console.error('Failed to fetch units:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [selectedGroup, selectedComponent, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUnits();
  };

  const openDiscardModal = (unit) => {
    setSelectedUnit(unit);
    setDiscardReason('Bag seal compromised / Microscopic hemolysis');
    setIsModalOpen(true);
  };

  const handleDiscardSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUnit) return;
    setSubmitting(true);

    try {
      await api.put(`/inventory/${selectedUnit._id}/discard`, {
        reason: discardReason,
      });
      setIsModalOpen(false);
      fetchUnits();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to discard unit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar
        title="Central Blood Inventory Registry"
        subtitle="Live tracking of all physical blood units across cold storage locations"
      />

      <div className="page-wrapper">
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
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '220px' }}>
              <input
                type="text"
                placeholder="Search Unit ID..."
                className="form-control"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Filter
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>Group:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>Component:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                >
                  {COMPONENTS.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#64748b' }}>Status:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="ISSUED">Issued</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="DISCARDED">Discarded</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Units Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit ID</th>
                <th>Blood Group</th>
                <th>Component</th>
                <th>Volume</th>
                <th>Collection</th>
                <th>Expiry / Shelf Life</th>
                <th>Screening</th>
                <th>Storage Shelf</th>
                <th>Inventory Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Loading blood units inventory...
                  </td>
                </tr>
              ) : units.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No blood units match the chosen filters.
                  </td>
                </tr>
              ) : (
                units.map((u) => {
                  const daysLeft = u.daysUntilExpiry;
                  const isNearExpiry = daysLeft !== null && daysLeft <= 5 && u.inventoryStatus === 'AVAILABLE';

                  return (
                    <tr key={u._id}>
                      <td>
                        <span style={{ fontWeight: '800', fontFamily: 'monospace', color: '#0f172a' }}>
                          {u.unitId}
                        </span>
                      </td>
                      <td>
                        <BloodGroupPill bloodGroup={u.bloodGroup} size="sm" />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                          {u.componentType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{u.volumeMl} mL</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {new Date(u.collectionDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                          {new Date(u.expiryDate).toLocaleDateString()}
                        </div>
                        {u.inventoryStatus === 'AVAILABLE' && (
                          <div
                            style={{
                              fontSize: '0.72rem',
                              color: isNearExpiry ? '#dc2626' : '#059669',
                              fontWeight: '700',
                            }}
                          >
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                          </div>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={u.testingStatus} />
                      </td>
                      <td>
                        <div style={{ fontSize: '0.78rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <MapPin size={12} color="#64748b" />
                          {u.storageLocation}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={u.inventoryStatus} />
                      </td>
                      <td>
                        {u.inventoryStatus === 'AVAILABLE' ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#dc2626' }}
                            onClick={() => openDiscardModal(u)}
                            title="Discard unit"
                          >
                            <Trash2 size={13} />
                            Discard
                          </button>
                        ) : u.inventoryStatus === 'ISSUED' ? (
                          <span style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: '600' }}>
                            {u.issuedToHospital ? `Issued to ${u.issuedToHospital.substring(0, 18)}...` : 'Issued'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {u.discardReason ? u.discardReason.substring(0, 20) + '...' : 'Archived'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Discard Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Discard Blood Unit ${selectedUnit?.unitId}`}
      >
        {selectedUnit && (
          <form onSubmit={handleDiscardSubmit}>
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: '#991b1b', fontWeight: '600' }}>
                Unit ID: {selectedUnit.unitId} ({selectedUnit.bloodGroup} - {selectedUnit.componentType})
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#7f1d1d' }}>
                Discarded blood units will be permanently decommissioned and logged in the traceability audit trail.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">Clinical Discard Reason</label>
              <textarea
                className="form-control"
                rows={3}
                required
                value={discardReason}
                onChange={(e) => setDiscardReason(e.target.value)}
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
                className="btn btn-danger"
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm Discard'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
