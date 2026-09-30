import React from 'react';
import { useAuth, DEMO_CREDENTIALS } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Heart, Building2, GraduationCap } from 'lucide-react';

export default function DemoBar() {
  const { user, quickDemoLogin, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    try {
      await quickDemoLogin(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'donor') navigate('/donor');
      else if (role === 'requester') navigate('/requester');
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  return (
    <div className="demo-switcher-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <GraduationCap size={16} color="#ef4444" />
        <span>
          <strong>Easwari Engineering College</strong> (CSE – AIML) | Priyan R (310624148072) | FSD Project
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>1-Click Role Switcher:</span>
        <div className="demo-btn-group">
          <button
            type="button"
            className={`demo-btn ${user?.role === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
            title="Login as Admin / Staff"
          >
            <Shield size={13} />
            Admin
          </button>
          <button
            type="button"
            className={`demo-btn ${user?.role === 'donor' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('donor')}
            title="Login as Donor (Priyan R)"
          >
            <Heart size={13} />
            Donor
          </button>
          <button
            type="button"
            className={`demo-btn ${user?.role === 'requester' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('requester')}
            title="Login as Hospital (Apollo)"
          >
            <Building2 size={13} />
            Hospital
          </button>
        </div>
      </div>
    </div>
  );
}
