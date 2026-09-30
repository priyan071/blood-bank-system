import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import { Building2, Search, PlusCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function RequesterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/requester');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch hospital dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar title="Hospital Dashboard" subtitle="Loading hospital requests..." />
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b' }}>Connecting to transfusion dispatch portal...</p>
        </div>
      </>
    );
  }

  const { stats, recentRequests } = data || {};

  return (
    <>
      <Navbar
        title="Hospital & Emergency Transfusion Portal"
        subtitle="Submit emergency blood requests, verify blood stock, and track order fulfillment"
      />

      <div className="page-wrapper">
        {/* KPI Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <Building2 size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalRequests || 0}</div>
              <div className="stat-label">Total Blood Requests</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.pendingRequests || 0}</div>
              <div className="stat-label">Pending Blood Requests</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon emerald">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.fulfilledRequests || 0}</div>
              <div className="stat-label">Fulfilled & Dispatched</div>
            </div>
          </div>
        </div>

        {/* Quick Action Banner */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Need Emergency Blood For a Patient?
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Check live cold-storage stock availability or submit an expedited request directly to the central blood bank.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/requester/search" className="btn btn-secondary">
              <Search size={16} /> Search Blood Stock
            </Link>
            <Link to="/requester/request" className="btn btn-primary">
              <PlusCircle size={16} /> Create Emergency Request
            </Link>
          </div>
        </div>

        {/* Recent Requests Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={18} color="#dc2626" />
              Your Recent Blood Requests
            </h3>
            <Link to="/requester/orders" style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>
              View All Orders
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Urgency</th>
                  <th>Blood Group</th>
                  <th>Component & Qty</th>
                  <th>Patient Name (Ref)</th>
                  <th>Required Date</th>
                  <th>Status</th>
                  <th>Allocated Units</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests && recentRequests.length > 0 ? (
                  recentRequests.map((r) => (
                    <tr key={r._id}>
                      <td><StatusBadge status={r.urgency} /></td>
                      <td><BloodGroupPill bloodGroup={r.bloodGroup} size="sm" /></td>
                      <td>
                        <strong>{r.requiredQuantity} Unit(s)</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {r.componentType.replace('_', ' ')}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{r.patientName}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                          {r.patientReference}
                        </div>
                      </td>
                      <td>{new Date(r.requiredDate).toLocaleDateString()}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td>
                        {r.status === 'FULFILLED' ? (
                          <span style={{ color: '#059669', fontWeight: '700', fontSize: '0.82rem' }}>
                            ✓ Units Issued & Dispatched
                          </span>
                        ) : r.status === 'PENDING' ? (
                          <span style={{ color: '#d97706', fontSize: '0.82rem' }}>
                            Awaiting staff allocation
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontSize: '0.82rem' }}>
                            Rejected: {r.rejectionReason}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No requests submitted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
