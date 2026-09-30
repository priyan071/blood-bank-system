import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, AlertCircle, Heart, Building2 } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Register() {
  const [role, setRole] = useState('donor');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [hospitalName, setHospitalName] = useState('');
  const [weightKg, setWeightKg] = useState(65);
  const [dateOfBirth, setDateOfBirth] = useState('2003-05-15');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name,
        email,
        password,
        role,
        phone,
        address,
        bloodGroup: role === 'donor' ? bloodGroup : undefined,
        hospitalName: role === 'requester' ? hospitalName : undefined,
        weightKg: role === 'donor' ? Number(weightKg) : undefined,
        dateOfBirth: role === 'donor' ? dateOfBirth : undefined,
      };

      const user = await register(payload);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'donor') navigate('/donor');
      else if (user.role === 'requester') navigate('/requester');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
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
      <div style={{ maxWidth: '540px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Create HemoVault Account
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Join the centralized blood transfusion & donor network
          </p>
        </div>

        <div className="card">
          {/* Role Picker */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">I want to register as:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setRole('donor')}
                className={`btn ${role === 'donor' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.75rem' }}
              >
                <Heart size={18} />
                <span>Blood Donor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('requester')}
                className={`btn ${role === 'requester' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.75rem' }}
              >
                <Building2 size={18} />
                <span>Hospital / Requester</span>
              </button>
            </div>
          </div>

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

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder={role === 'donor' ? 'e.g. Priyan R' : 'e.g. Dr. K. Ramanathan'}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password (min 6 chars)</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  className="form-control"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="+91 98401 23456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">City / Location</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Chennai, Tamil Nadu"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {role === 'donor' ? (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select
                    className="form-control"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    min={40}
                    max={150}
                    required
                    className="form-control"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="form-control"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">Hospital / Healthcare Facility Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Apollo Specialty Hospitals, Greams Road"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem' }}
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Complete Registration'}
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
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#dc2626', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
