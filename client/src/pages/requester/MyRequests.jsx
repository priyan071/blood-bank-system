import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import { Clock, PlusCircle, CheckCircle2, AlertTriangle, Building2, Droplet } from 'lucide-react';

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests/my');
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to load hospital requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  return (
    <>
      <Navbar
        title="Track Hospital Blood Requests"
        subtitle="Monitor live requisition status, unit allocations, and delivery confirmation"
      />

      <div className="page-wrapper">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="#dc2626" />
              Requisition Order History & Real-Time Tracking
            </h3>
            <Link to="/requester/request" className="btn btn-primary btn-sm">
              <PlusCircle size={14} /> New Emergency Request
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date Logged</th>
                  <th>Urgency</th>
                  <th>Blood Group</th>
                  <th>Component & Qty</th>
                  <th>Patient Details</th>
                  <th>Required By</th>
                  <th>Status</th>
                  <th>Allocated Unit ID(s)</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      Querying hospital order history...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No blood requests registered yet.
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <StatusBadge status={r.urgency} />
                      </td>
                      <td>
                        <BloodGroupPill bloodGroup={r.bloodGroup} size="sm" />
                      </td>
                      <td>
                        <strong>{r.requiredQuantity} Unit(s)</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {r.componentType.replace('_', ' ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{r.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          MRN: {r.patientReference}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: '500' }}>
                          {new Date(r.requiredDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>
                        {r.status === 'FULFILLED' ? (
                          <div>
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <CheckCircle2 size={12} /> Dispatched
                            </span>
                            {r.allocatedUnitIds && r.allocatedUnitIds.length > 0 ? (
                              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#2563eb', fontWeight: '700' }}>
                                {r.allocatedUnitIds.join(', ')}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified Units</span>
                            )}
                          </div>
                        ) : r.status === 'PENDING' ? (
                          <span style={{ fontSize: '0.8rem', color: '#d97706' }}>
                            Priority queue verification in progress
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#dc2626' }}>
                            Declined: {r.rejectionReason}
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
      </div>
    </>
  );
}
