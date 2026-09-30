import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import BloodGroupPill from '../../components/BloodGroupPill';
import { Search, Database, PlusCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['ALL', 'WHOLE_BLOOD', 'RED_BLOOD_CELLS', 'PLATELETS', 'PLASMA'];

export default function BloodSearch() {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedComponent, setSelectedComponent] = useState('ALL');
  const [availableUnits, setAvailableUnits] = useState([]);
  const [summaryMatrix, setSummaryMatrix] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      let searchUrl = '/inventory/search?';
      if (selectedGroup !== 'ALL') searchUrl += `bloodGroup=${encodeURIComponent(selectedGroup)}&`;
      if (selectedComponent !== 'ALL') searchUrl += `componentType=${selectedComponent}`;

      const [searchRes, summaryRes] = await Promise.all([
        api.get(searchUrl),
        api.get('/inventory/summary'),
      ]);

      setAvailableUnits(searchRes.data.units || []);
      setSummaryMatrix(summaryRes.data.matrix || {});
    } catch (err) {
      console.error('Failed to search blood stock:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [selectedGroup, selectedComponent]);

  const handleRequestGroup = (bg) => {
    navigate(`/requester/request?bloodGroup=${encodeURIComponent(bg)}`);
  };

  return (
    <>
      <Navbar
        title="Live Blood Stock Availability Finder"
        subtitle="Real-time availability of verified, pathogen-screened blood units ready for dispatch"
      />

      <div className="page-wrapper">
        {/* Filter Toolbar */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Blood Group:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>Component:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto' }}
                  value={selectedComponent}
                  onChange={(e) => setSelectedComponent(e.target.value)}
                >
                  {COMPONENTS.map((c) => (
                    <option key={c} value={c}>{c.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.9rem', color: '#059669', fontWeight: '700' }}>
              ✓ {availableUnits.length} Ready Units Found
            </div>
          </div>
        </div>

        {/* 8-Group Availability Grid Cards */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
            Available Units By Blood Group
          </h3>

          <div className="stock-matrix-grid">
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
              const stock = summaryMatrix[bg]?.totalUnits || 0;
              const isSelected = selectedGroup === bg;

              return (
                <div
                  key={bg}
                  className="stock-box"
                  style={{
                    borderColor: isSelected ? '#dc2626' : undefined,
                    backgroundColor: isSelected ? '#fef2f2' : 'white',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <BloodGroupPill bloodGroup={bg} size="sm" />
                  </div>
                  <div className="stock-box-count" style={{ color: stock > 0 ? '#0f172a' : '#ef4444' }}>
                    {stock}
                  </div>
                  <div className="stock-box-unit">Units Ready</div>

                  <button
                    type="button"
                    onClick={() => handleRequestGroup(bg)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', marginTop: '0.75rem', fontSize: '0.75rem' }}
                  >
                    Request {bg}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Units Available Details Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Database size={18} color="#dc2626" />
              Verified Blood Units Matching Search
            </h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Unit ID</th>
                  <th>Blood Group</th>
                  <th>Component</th>
                  <th>Volume</th>
                  <th>Expiry Date</th>
                  <th>Storage Location</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Querying real-time cold storage...
                    </td>
                  </tr>
                ) : availableUnits.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No available units found for current criteria. Submit an emergency request to trigger blood bank collection.
                    </td>
                  </tr>
                ) : (
                  availableUnits.map((u) => (
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
                        <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                          {u.componentType.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{u.volumeMl} mL</td>
                      <td>{new Date(u.expiryDate).toLocaleDateString()}</td>
                      <td>{u.storageLocation}</td>
                      <td>
                        <span className="badge badge-available">Available</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleRequestGroup(u.bloodGroup)}
                        >
                          <PlusCircle size={13} /> Request
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
