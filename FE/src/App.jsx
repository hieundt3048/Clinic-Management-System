import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { useState, useEffect, Suspense } from "react";
import Register from './pages/Register';
import Login from './pages/Login';
import HomePage from './pages/HomePage';
import AppointmentHistoryPage from './pages/AppointmentHistoryPage';
import AppointmentPage from './pages/AppointmentPage';
import HealthProfilePage from './pages/HealthProfilePage';
import MedicationReminderPage from './pages/MedicationReminderPage';
import UserProfilePage from './pages/UserProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import MedicalHistory from './pages/MedicalHistory';
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import { clearAuth } from './services/api';
import BillingPage from './pages/BillingPage';
import AdminRevenuePage     from './pages/admin/AdminRevenuePage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminInvoicesPage    from './pages/admin/AdminInvoicesPage';
import AdminStaffPage       from './pages/admin/AdminStaffPage';
import './App.css';

// Các trang KHÔNG hiện sidebar
const NO_SIDEBAR_PATHS = ['/login', '/register'];



const Layout = ({ user, children }) => {
  const location = useLocation();

  const isAdminPath = location.pathname.startsWith('/admin');
  
  const hideSidebar = NO_SIDEBAR_PATHS.includes(location.pathname) || !user || isAdminPath;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
      {!hideSidebar && <Sidebar />}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />
      <Layout user={user}>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/register" element={<Register />} />

            {user ? (
              <>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin"              element={<AdminRevenuePage />} />
                <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
                <Route path="/admin/invoices"     element={<AdminInvoicesPage />} />
                <Route path="/admin/staff"        element={<AdminStaffPage />} />
                <Route path="/doctor" element={<DoctorDashboard />} />
                {user.role === 'PATIENT' ? (
                  <>
                    <Route path="/appointments" element={<AppointmentPage />} />
                    <Route path="/appointment-history" element={<AppointmentHistoryPage />} />
                    <Route path="/health-profile" element={<HealthProfilePage />} />
                    <Route path="/medication-reminder" element={<MedicationReminderPage />} />
                    <Route path="/medical-history" element={<MedicalHistory />} />
                    <Route path="/billing" element={<BillingPage />} />
                  </>
                ) : null}
                <Route path="/user-profile" element={<UserProfilePage />} />
              </>
            ) : (
              <Route path="/*" element={<Navigate to="/login" />} />
            )}

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
