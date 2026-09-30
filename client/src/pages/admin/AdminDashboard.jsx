import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import {
  Database,
  Users,
  FlaskConical,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <Navbar title="Executive Dashboard" subtitle="Loading live blood bank metrics..." />
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b' }}>Connecting to MongoDB real-time telemetry...</p>
        </div>
      </>
    );
  }

  const { stats, bloodGroupMatrix, componentStock, recentTransactions, urgentRequests } = data || {};

  return (
    <>
      <Navbar
        title="Admin Executive Dashboard"
        subtitle="Real-Time Blood Bank Operations & Inventory Telemetry"
      />

      <div className="page-wrapper">
        {/* Critical Emergency Banner if any pending critical requests exist */}
        {stats?.criticalRequests > 0 && (
          <div
            style={{
              backgroundColor: '#fff1f2',
              border: '2px solid #f43f5e',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(225, 29, 72, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e11d48',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulseGlow 1.5s infinite',
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div>
                <h4 style={{ color: '#9f1239', margin: 0, fontSize: '1rem', fontWeight: '800' }}>
                  {stats.criticalRequests} CRITICAL EMERGENCY BLOOD REQUEST(S) PENDING!
                </h4>
                <p style={{ color: '#be123c', margin: '2px 0 0 0', fontSize: '0.85rem' }}>
                  Active patient emergency reported by hospital trauma center. Immediate inventory allocation required.
                </p>
              </div>
            </div>
            <Link to="/admin/requests" className="btn btn-danger btn-sm">
              Review & Issue Blood <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Live KPI Metric Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red">
              <Database size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.availableUnits || 0}</div>
              <div className="stat-label">Available Blood Units</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon emerald">
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalDonors || 0}</div>
              <div className="stat-label">Total Donors ({stats?.eligibleDonors || 0} Eligible)</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amber">
              <FlaskConical size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.pendingTests || 0}</div>
              <div className="stat-label">Lab Tests Pending</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <AlertTriangle size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.pendingEmergencyRequests || 0}</div>
              <div className="stat-label">Pending Emergency Requests</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <Calendar size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.todayAppointments || 0}</div>
              <div className="stat-label">Today's Appointments</div>
            </div>
          </div>
        </div>

        {/* Real-time Blood Inventory Matrix by Blood Group */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Activity size={20} color="#dc2626" />
                Live Blood Stock Availability Matrix (8 Blood Groups)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
                Screened and safe units currently available in temperature-controlled cold vault
              </p>
            </div>
            <Link to="/admin/inventory" className="btn btn-secondary btn-sm">
              Manage Inventory
            </Link>
          </div>

          <div className="stock-matrix-grid">
            {BLOOD_GROUPS.map((bg) => {
              const count = bloodGroupMatrix?.[bg] || 0;
              const maxStock = 10; // baseline capacity for gauge
              const percent = Math.min(100, Math.round((count / maxStock) * 100));

              return (
                <div key={bg} className="stock-box">
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <BloodGroupPill bloodGroup={bg} size="sm" />
                  </div>
                  <div className="stock-box-count">{count}</div>
                  <div className="stock-box-unit">Units In Stock</div>
                  <div className="stock-progress-bar">
                    <div
                      className="stock-progress-fill"
                      style={{
                        width: `${Math.max(percent, 8)}%`,
                        backgroundColor:
                          count === 0 ? '#ef4444' : count <= 2 ? '#f59e0b' : '#10b981',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Grid: Component Stock & Recent Traceability Transactions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
          {/* Component Breakdown Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <TrendingUp size={18} color="#dc2626" />
                Blood Component Inventory Breakdown
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { name: 'Whole Blood (450ml)', key: 'WHOLE_BLOOD', shelf: '35 Days' },
                { name: 'Red Blood Cells (PRBC)', key: 'RED_BLOOD_CELLS', shelf: '42 Days' },
                { name: 'Platelet Concentrates (RDP)', key: 'PLATELETS', shelf: '5 Days' },
                { name: 'Fresh Frozen Plasma (FFP)', key: 'PLASMA', shelf: '1 Year' },
              ].map((comp) => {
                const stockItem = componentStock?.find((c) => c._id === comp.key);
                const count = stockItem ? stockItem.count : 0;

                return (
                  <div
                    key={comp.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: '#0f172a' }}>
                        {comp.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Shelf Life: {comp.shelf}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: '800',
                          color: count > 0 ? '#0f172a' : '#ef4444',
                        }}
                      >
                        {count}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '4px' }}>
                        units
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Traceability Transactions Audit Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Clock size={18} color="#dc2626" />
                Recent Traceability Audit Log
              </h3>
              <Link to="/admin/traceability" style={{ fontSize: '0.82rem', color: '#dc2626', textDecoration: 'none', fontWeight: '700' }}>
                View All
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTransactions && recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <div
                    key={tx._id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #f1f5f9',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <BloodGroupPill bloodGroup={tx.bloodGroup} size="sm" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                          Unit {tx.unitId} - {tx.transactionType}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {tx.recipientHospital || tx.notes || 'System transaction verified'}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={tx.transactionType} />
                  </div>
                ))
              ) : (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent transactions recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
