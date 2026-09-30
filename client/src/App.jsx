import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout & Protected Route
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DonorManagement from './pages/admin/DonorManagement';
import AppointmentsList from './pages/admin/AppointmentsList';
import BloodTestingLab from './pages/admin/BloodTestingLab';
import BloodInventory from './pages/admin/BloodInventory';
import EmergencyRequests from './pages/admin/EmergencyRequests';
import TraceabilityAudit from './pages/admin/TraceabilityAudit';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import EligibilityCheck from './pages/donor/EligibilityCheck';
import BookAppointment from './pages/donor/BookAppointment';
import DonationHistory from './pages/donor/DonationHistory';

// Requester Pages
import RequesterDashboard from './pages/requester/RequesterDashboard';
import BloodSearch from './pages/requester/BloodSearch';
import EmergencyRequestForm from './pages/requester/EmergencyRequestForm';
import MyRequests from './pages/requester/MyRequests';

function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'donor') return <Navigate to="/donor" replace />;
  if (user.role === 'requester') return <Navigate to="/requester" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Module */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="donors" element={<DonorManagement />} />
        <Route path="appointments" element={<AppointmentsList />} />
        <Route path="testing" element={<BloodTestingLab />} />
        <Route path="inventory" element={<BloodInventory />} />
        <Route path="requests" element={<EmergencyRequests />} />
        <Route path="traceability" element={<TraceabilityAudit />} />
        <Route path="reports" element={<ReportsAnalytics />} />
      </Route>

      {/* Donor Module */}
      <Route
        path="/donor"
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DonorDashboard />} />
        <Route path="eligibility" element={<EligibilityCheck />} />
        <Route path="book" element={<BookAppointment />} />
        <Route path="history" element={<DonationHistory />} />
      </Route>

      {/* Requester / Hospital Module */}
      <Route
        path="/requester"
        element={
          <ProtectedRoute allowedRoles={['requester']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RequesterDashboard />} />
        <Route path="search" element={<BloodSearch />} />
        <Route path="request" element={<EmergencyRequestForm />} />
        <Route path="orders" element={<MyRequests />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
