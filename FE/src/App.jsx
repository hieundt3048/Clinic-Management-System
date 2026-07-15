import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense } from "react";
import Register from './pages/Register';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import AppointmentHistoryPage from './pages/AppointmentHistoryPage';
import AppointmentPage from './pages/AppointmentPage';
import HealthProfilePage from './pages/HealthProfilePage';
import HealthTrackingPage from './pages/HealthTrackingPage';
import MedicationReminderPage from './pages/MedicationReminderPage';
import AppointmentNotificationsPage from './pages/AppointmentNotificationsPage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MedicalHistory from './pages/MedicalHistory';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AdminRevenuePage      from './pages/admin/AdminRevenuePage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminInvoicesPage     from './pages/admin/AdminInvoicesPage';
import AdminStaffPage        from './pages/admin/AdminStaffPage';
import AdminUsersPage        from './pages/admin/AdminUsersPage';
import AdminSystemMonitorPage from './pages/admin/AdminSystemMonitorPage';
import DoctorAppointmentsPage  from './pages/doctor/DoctorAppointmentsPage';
import DoctorPrescriptionsPage from './pages/doctor/DoctorPrescriptionsPage';
import DoctorMedicalRecordsPage from './pages/doctor/DoctorMedicalRecordsPage';
import DoctorServiceRequestsPage from './pages/doctor/DoctorServiceRequestsPage';
import DoctorPatientsPage      from './pages/doctor/DoctorPatientsPage';
import PrescriptionsPage from './pages/PrescriptionsPage';
import TestResultsPage from './pages/TestResultsPage';
import BillingPage from './pages/BillingPage';
import { clearAuth } from './services/api';
import './App.css';

const NO_SIDEBAR_PATHS = ['/login', '/register'];

const defaultPathForRole = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'DOCTOR') return '/doctor';
  return '/';
};

const RoleRoute = ({ user, roles, children }) => {
  if (!roles.includes(user?.role)) {
    return <Navigate to={defaultPathForRole(user?.role)} replace />;
  }
  return children;
};
const Layout = ({ user, loading, children }) => {
  const location = useLocation();
  const isAdminPath  = location.pathname.startsWith('/admin');
  const isDoctorPath = location.pathname.startsWith('/doctor');
  const hideSidebar  = NO_SIDEBAR_PATHS.includes(location.pathname)
                    || !user
                    || isAdminPath
                    || isDoctorPath;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <main className="flex-grow">{children}</main>
    </div>
  );
};

function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Layout user={user} loading={loading}>
        <Suspense fallback={<div className="flex justify-center py-10"><div className="animate-spin h-6 w-6 border-b-2 border-blue-500 rounded-full" /></div>}>
          <Routes>
            <Route path="/login"    element={<Login onLogin={setUser} />} />
            <Route path="/register" element={<Register />} />

            {!loading && (
              user ? (
                <>
                  <Route path="/"               element={<HomePage />} />
                  <Route path="/user-profile"   element={<UserProfilePage />} />
                  <Route path="/billing"        element={<RoleRoute user={user} roles={['PATIENT']}><BillingPage /></RoleRoute>} />

                  {/* Admin */}
                  <Route path="/admin"              element={<RoleRoute user={user} roles={['ADMIN']}><AdminRevenuePage /></RoleRoute>} />
                  <Route path="/admin/appointments" element={<RoleRoute user={user} roles={['ADMIN']}><AdminAppointmentsPage /></RoleRoute>} />
                  <Route path="/admin/invoices"     element={<RoleRoute user={user} roles={['ADMIN']}><AdminInvoicesPage /></RoleRoute>} />
                  <Route path="/admin/staff"        element={<RoleRoute user={user} roles={['ADMIN']}><AdminStaffPage /></RoleRoute>} />
                  <Route path="/admin/users"        element={<RoleRoute user={user} roles={['ADMIN']}><AdminUsersPage /></RoleRoute>} />
                  <Route path="/admin/system-monitor" element={<RoleRoute user={user} roles={['ADMIN']}><AdminSystemMonitorPage /></RoleRoute>} />

                  {/* Doctor */}
                  <Route path="/doctor"               element={<RoleRoute user={user} roles={['DOCTOR']}><DoctorAppointmentsPage /></RoleRoute>} />
                  <Route path="/doctor/prescriptions" element={<RoleRoute user={user} roles={['DOCTOR']}><DoctorPrescriptionsPage /></RoleRoute>} />
                  <Route path="/doctor/medical-records" element={<RoleRoute user={user} roles={['DOCTOR']}><DoctorMedicalRecordsPage /></RoleRoute>} />
                  <Route path="/doctor/service-requests" element={<RoleRoute user={user} roles={['DOCTOR']}><DoctorServiceRequestsPage /></RoleRoute>} />
                  <Route path="/doctor/patients"      element={<RoleRoute user={user} roles={['DOCTOR']}><DoctorPatientsPage /></RoleRoute>} />

                  {/* Patient */}
                  {user.role === 'PATIENT' && (
                    <>
                      <Route path="/appointments"       element={<AppointmentPage />} />
                      <Route path="/appointment-notifications" element={<AppointmentNotificationsPage />} />
                      <Route path="/appointment-history" element={<AppointmentHistoryPage />} />
                      <Route path="/health-profile"     element={<HealthProfilePage />} />
                      <Route path="/health-tracking"    element={<HealthTrackingPage />} />
                      <Route path="/medication-reminder" element={<MedicationReminderPage />} />
                      <Route path="/medical-history"    element={<MedicalHistory />} />
                      <Route path="/profile" element={<UserProfilePage />} />
                      <Route path="/prescriptions" element={<PrescriptionsPage />} />
                      <Route path="/test-results"  element={<TestResultsPage />} />
                    </>
                  )}

                  <Route path="*" element={<NotFoundPage />} />
                </>
              ) : (
                // Chưa đăng nhập → redirect về login
                <Route path="*" element={<Navigate to="/login" replace />} />
              )
            )}
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
