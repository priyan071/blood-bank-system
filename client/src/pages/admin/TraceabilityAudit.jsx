import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import BloodGroupPill from '../../components/BloodGroupPill';
import { GitCommit, Search, ShieldCheck, CheckCircle2, Clock, Building2, User } from 'lucide-react';

export default function TraceabilityAudit() {
  const [unitIdInput, setUnitIdInput] = useState('BLD-2026-1019');
  const [traceResult, setTraceResult] = useState(null);
  const [tracing, setTracing] = useState(false);
  const [traceError, setTraceError] = useState('');

  // General transactions table
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(true);
  const [txSearch, setTxSearch] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoadingTx(true);
      let url = '/transactions';
      if (txSearch) url += `?search=${encodeURIComponent(txSearch)}`;
      const res = await api.get(url);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    handleTraceSubmit();
  }, []);

  const handleTraceSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!unitIdInput.trim()) return;

    setTracing(true);
    setTraceError('');
    try {
      const res = await api.get(`/transactions/trace/${unitIdInput.trim()}`);
      setTraceResult(res.data);
    } catch (err) {
      setTraceResult(null);
      setTraceError(err.response?.data?.message || 'Blood unit not found in registry');
    } finally {
      setTracing(false);
    }
  };

  return (
    <>
      <Navbar
        title="Blood Unit Traceability & Complete Audit Trail"
        subtitle="End-to-end chain of custody from phlebotomy collection to patient bedside transfusion"
      />

      <div className="page-wrapper">
        {/* Unit Trace Lookup Card */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">
              <GitCommit size={20} color="#dc2626" />
              Real-Time Unit Lifecycle Tracker
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Enter any Blood Unit ID to reconstruct full medical journey
            </span>
          </div>

          <form onSubmit={handleTraceSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="e.g. BLD-2026-1001"
              className="form-control"
              value={unitIdInput}
              onChange={(e) => setUnitIdInput(e.target.value)}
            />
            <button type="submit" className="btn btn-primary" disabled={tracing}>
              <Search size={16} />
              {tracing ? 'Tracing...' : 'Trace Unit'}
            </button>
          </form>

          {traceError && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.85rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
              }}
            >
              {traceError}
            </div>
          )}

          {traceResult && (
            <div>
              {/* Unit Summary Pill */}
              <div
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <BloodGroupPill bloodGroup={traceResult.unit.bloodGroup} size="lg" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800' }}>
                      Unit ID: {traceResult.unit.unitId}
                    </h4>
                    <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                      Component: <strong>{traceResult.unit.componentType.replace('_', ' ')}</strong> | Volume: {traceResult.unit.volumeMl}mL
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <StatusBadge status={traceResult.unit.inventoryStatus} />
                  <StatusBadge status={traceResult.unit.testingStatus} />
                </div>
              </div>

              {/* Lifecycle Vertical Timeline */}
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.75rem' }}>
                Chain of Custody Events:
              </h4>

              <div className="trace-timeline">
                {traceResult.timeline.map((event, index) => {
                  let pointClass = 'timeline-point ';
                  if (event.transactionType === 'ISSUE' || event.transactionType === 'TEST_PASS') pointClass += 'success';
                  else if (event.transactionType === 'TEST_FAIL' || event.transactionType === 'DISCARD') pointClass += 'danger';
                  else pointClass += 'info';

                  return (
                    <div key={event._id || index} className="timeline-step">
                      <div className={pointClass} />
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a' }}>
                              {event.transactionType.replace('_', ' ')}
                            </span>
                            <span style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: '8px' }}>
                              {new Date(event.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <StatusBadge status={event.transactionType} />
                        </div>

                        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: '#334155' }}>
                          {event.notes || 'System transaction verified.'}
                        </p>

                        <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                          <span>Operator: <strong>{event.performedByName || 'Medical Officer'}</strong></span>
                          {event.recipientHospital && (
                            <span>Recipient Hospital: <strong>{event.recipientHospital}</strong></span>
                          )}
                          {event.patientReference && (
                            <span>Patient: <strong>{event.patientReference}</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Global Transactions Audit Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Clock size={20} color="#dc2626" />
              Global System Transactions Audit Log
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Immutable log of every blood bank movement
            </span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Unit ID</th>
                  <th>Group & Component</th>
                  <th>Transaction Type</th>
                  <th>Operator</th>
                  <th>Recipient / Patient</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {loadingTx ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                      Loading audit records...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No audit transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => {
                            setUnitIdInput(tx.unitId);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#dc2626',
                            fontWeight: '800',
                            fontFamily: 'monospace',
                          }}
                        >
                          {tx.unitId}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BloodGroupPill bloodGroup={tx.bloodGroup} size="sm" />
                          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                            {tx.componentType.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={tx.transactionType} />
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem' }}>
                          {tx.performedByName || 'Administrator'}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: '600' }}>
                          {tx.recipientHospital || '—'}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {tx.patientReference}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {tx.notes}
                        </span>
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
