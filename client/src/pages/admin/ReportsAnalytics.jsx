import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import BloodGroupPill from '../../components/BloodGroupPill';
import { BarChart3, Printer, Download, CheckCircle2, TrendingUp, ShieldCheck, PieChart } from 'lucide-react';

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      setReport(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <>
        <Navbar title="Reports & Analytics" subtitle="Compiling statutory metrics..." />
        <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: '#64748b' }}>Generating real-time statistical report...</p>
        </div>
      </>
    );
  }

  const { metrics, stockByGroup, componentBreakdown, reportDate, generatedBy } = report || {};

  return (
    <>
      <Navbar
        title="Blood Bank Performance & Statutory Reports"
        subtitle="Operational analytics, transfusion fulfillment rate, and inventory statistics"
      />

      <div className="page-wrapper">
        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Generated on: <strong>{new Date(reportDate).toLocaleString()}</strong> by {generatedBy}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handlePrint}>
              <Printer size={15} /> Print Report
            </button>
          </div>
        </div>

        {/* High-Level Statutory Metrics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon red">
              <BarChart3 size={24} />
            </div>
            <div>
              <div className="stat-value">{metrics?.totalUnitsCollected || 0}</div>
              <div className="stat-label">Total Units Collected</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon emerald">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="stat-value">{metrics?.issuedUnits || 0}</div>
              <div className="stat-label">Units Issued to Patients</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-value">{metrics?.fulfillmentRate || 100}%</div>
              <div className="stat-label">Emergency Fulfillment Rate</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              <PieChart size={24} />
            </div>
            <div>
              <div className="stat-value">{metrics?.discardedUnits || 0}</div>
              <div className="stat-label">Units Discarded (Biohazard)</div>
            </div>
          </div>
        </div>

        {/* Blood Group Breakdown Table */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <BarChart3 size={18} color="#dc2626" />
              Inventory Breakdown by Blood Group
            </h3>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Available in Vault</th>
                  <th>Issued to Patients</th>
                  <th>Discarded</th>
                  <th>Total Handled</th>
                </tr>
              </thead>
              <tbody>
                {stockByGroup && stockByGroup.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <BloodGroupPill bloodGroup={item._id} size="sm" />
                    </td>
                    <td>
                      <strong style={{ color: '#059669', fontSize: '1.05rem' }}>{item.available}</strong> units
                    </td>
                    <td>
                      <span style={{ color: '#2563eb', fontWeight: '700' }}>{item.issued}</span> units
                    </td>
                    <td>
                      <span style={{ color: item.discarded > 0 ? '#dc2626' : '#94a3b8' }}>{item.discarded}</span> units
                    </td>
                    <td>
                      <strong>{item.total}</strong> units
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Project Compliance Footer */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#64748b',
          }}
        >
          <p style={{ fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
            HemoVault - Centralized Blood Bank Management System
          </p>
          <p>
            Department of Computer Science & Engineering (AIML) | Easwari Engineering College, Chennai
          </p>
          <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>
            Project Reference: Priyan R (310624148072), III – Year | Guided by Ms. Divyanjali
          </p>
        </div>
      </div>
    </>
  );
}
