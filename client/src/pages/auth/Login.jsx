import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { LogIn, Shield, Heart, Building2, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'donor') navigate('/donor');
      else if (user.role === 'requester') navigate('/requester');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setError('');
    setLoading(true);
    try {
      const user = await quickDemoLogin(role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'donor') navigate('/donor');
      else if (user.role === 'requester') navigate('/requester');
    } catch (err) {
      setError('Demo login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '460px', width: '100%' }}>
        {/* College Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              fontSize: '2rem',
              boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.4)',
            }}
          >
            🩸
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            HemoVault
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Centralized Blood Bank & Transfusion Management System
          </p>
          <div
            style={{
              display: 'inline-block',
              marginTop: '8px',
              fontSize: '0.75rem',
              fontWeight: '600',
              padding: '3px 10px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '999px',
            }}
          >
            Easwari Engineering College | FSD Project
          </div>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)',
          }}
        >
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: '700',
              color: '#991b1b',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            ⚡ Quick 1-Click Evaluation Logins:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem 0.4rem', gap: '4px' }}
            >
              <Shield size={16} color="#dc2626" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('donor')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem 0.4rem', gap: '4px' }}
            >
              <Heart size={16} color="#059669" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Donor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('requester')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', flexDirection: 'column', padding: '0.6rem 0.4rem', gap: '4px' }}
            >
              <Building2 size={16} color="#2563eb" />
              <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Hospital</span>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.25rem' }}>
            Sign In to Your Account
          </h2>

          {error && (
            <div
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem',
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-control"
                placeholder="e.g. admin@bloodbank.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                required
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              <LogIn size={18} />
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid #f1f5f9',
              fontSize: '0.88rem',
              color: '#64748b',
            }}
          >
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>
              Register Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
