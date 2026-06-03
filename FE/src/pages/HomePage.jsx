import React, { useState, useEffect } from 'react';
import PatientDashboard from '../components/PatientDashboard';
import DoctorDashboard from '../components/DoctorDashboard';
import AdminDashboard from '../components/AdminDashboard';
import { getCurrentUser } from '../services/api';

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="text-center mt-10">Đang tải...</div>;
  }

  if (!user) {
    // Điều này không nên xảy ra vì đã có PrivateRoute, nhưng để phòng ngừa
    return <div className="text-center mt-10">Vui lòng đăng nhập.</div>;
  }

  const renderDashboard = () => {
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

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default HomePage;
