import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FlaskConical,
  Database,
  AlertTriangle,
  GitCommit,
  BarChart3,
  HeartHandshake,
  Search,
  PlusCircle,
  Clock,
  LogOut,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const getAdminLinks = () => [
    { to: '/admin', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/donors', label: 'Donor Management', icon: Users },
    { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
    { to: '/admin/testing', label: 'Blood Testing Lab', icon: FlaskConical },
    { to: '/admin/inventory', label: 'Blood Inventory', icon: Database },
    { to: '/admin/requests', label: 'Emergency Requests', icon: AlertTriangle },
    { to: '/admin/traceability', label: 'Traceability & Audit', icon: GitCommit },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const getDonorLinks = () => [
    { to: '/donor', label: 'Donor Dashboard', icon: LayoutDashboard },
    { to: '/donor/eligibility', label: 'Eligibility Check', icon: ShieldCheck },
    { to: '/donor/book', label: 'Book Appointment', icon: Calendar },
    { to: '/donor/history', label: 'Donation History', icon: HeartHandshake },
  ];

  const getRequesterLinks = () => [
    { to: '/requester', label: 'Hospital Dashboard', icon: LayoutDashboard },
    { to: '/requester/search', label: 'Search Blood Stock', icon: Search },
    { to: '/requester/request', label: 'Emergency Request', icon: PlusCircle },
    { to: '/requester/orders', label: 'Track Requests', icon: Clock },
  ];

  let navLinks = [];
  if (user?.role === 'admin') navLinks = getAdminLinks();
  else if (user?.role === 'donor') navLinks = getDonorLinks();
  else if (user?.role === 'requester') navLinks = getRequesterLinks();

  return (
    <aside
      style={{
        width: '270px',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        minHeight: '100vh',
        borderRight: '1px solid #1e293b',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.85rem',
        }}
      >
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)',
            fontSize: '1.3rem',
          }}
        >
          🩸
        </div>
        <div>
          <h2
            style={{
              fontSize: '1.2rem',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              color: '#ffffff',
              margin: 0,
            }}
          >
            HemoVault
          </h2>
          <span
            style={{
              fontSize: '0.72rem',
              color: '#94a3b8',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}
          >
            Blood Bank System
          </span>
        </div>
      </div>

      {/* User Info Capsule */}
      {user && (
        <div
          style={{
            margin: '1rem 1rem 0.5rem 1rem',
            padding: '0.85rem 1rem',
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            border: '1px solid #334155',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: '700', color: '#ffffff' }}>
              {user.name.split(' ')[0]} {user.name.split(' ')[1] || ''}
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor:
                  user.role === 'admin'
                    ? '#dc2626'
                    : user.role === 'donor'
                    ? '#059669'
                    : '#2563eb',
                color: 'white',
                textTransform: 'uppercase',
              }}
            >
              {user.role}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
            {user.role === 'requester'
              ? user.hospitalName || 'Hospital Unit'
              : user.role === 'donor'
              ? `Blood Group: ${user.bloodGroup || 'O+'}`
              : 'Medical Administrator'}
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        <div
          style={{
            fontSize: '0.68rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            color: '#64748b',
            letterSpacing: '0.05em',
            padding: '0 0.5rem 0.5rem 0.5rem',
          }}
        >
          {user?.role === 'admin' ? 'Administration' : user?.role === 'donor' ? 'Donor Portal' : 'Hospital Services'}
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/admin' || item.to === '/donor' || item.to === '/requester'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#dc2626' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease',
                  })}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            border: '1px solid #334155',
            color: '#cbd5e1',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
