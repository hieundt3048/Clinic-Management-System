import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PatientDashboard from './components/PatientDashboard';
import { clearAuth } from './services/api';
import './App.css';

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
      <div className="flex">
        <main className="flex-grow">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/register" element={<Register />} />

              {user ? (
                <>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/doctor" element={<DoctorDashboard />} />
                  <Route path="/patient" element={<PatientDashboard />} />
                  {user.role === 'PATIENT' ? (
                    <>
                      <Route path="/appointments" element={<AppointmentPage />} />
                      <Route path="/appointment-history" element={<AppointmentHistoryPage />} />
                      <Route path="/health-profile" element={<HealthProfilePage />} />
                      <Route path="/medication-reminder" element={<MedicationReminderPage />} />
                      <Route path="/medical-history" element={<MedicalHistory />} />
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
        </main>
      </div>
    </Router>
  )
}

export default App;
