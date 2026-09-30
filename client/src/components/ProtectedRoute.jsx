import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          color: '#64748b',
        }}
      >
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'donor') return <Navigate to="/donor" replace />;
    if (user.role === 'requester') return <Navigate to="/requester" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}
