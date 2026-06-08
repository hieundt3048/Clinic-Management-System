import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import PatientDashboard from '../components/PatientDashboard';
import DoctorDashboard from '../components/DoctorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { getStoredUser } from '../services/api';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  switch (user.role) {
    case 'PATIENT':
      return <PatientDashboard user={user} />;
    case 'DOCTOR':
      return <DoctorDashboard user={user} />;
    case 'ADMIN':
      return <AdminDashboard user={user} />;
    default:
      return <div>Vai trò không hợp lệ.</div>;
  }
};

export default HomePage;
