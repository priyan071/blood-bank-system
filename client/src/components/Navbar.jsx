import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Activity, ShieldCheck } from 'lucide-react';

export default function Navbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          {title || 'Blood Bank Management System'}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* System Health Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.75rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '999px',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#065f46',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.25)',
            }}
          />
          MongoDB Active
        </div>

        {/* User Card */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
              }}
            >
              {user.name.charAt(0)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', lineHeight: 1.2 }}>
                {user.name}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>
                {user.role} {user.bloodGroup ? `(${user.bloodGroup})` : ''}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
