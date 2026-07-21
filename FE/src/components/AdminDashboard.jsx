import React from 'react';

const AdminDashboard = ({ user }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bảng điều khiển của Quản trị viên</h1>
      <p className="mb-6">Xin chào, {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thống kê tổng quan */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-6 text-center shadow-md shadow-sky-100">
          <h2 className="text-xl font-semibold">Tổng số người dùng</h2>
          <p className="text-3xl font-bold">150</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-6 text-center shadow-md shadow-sky-100">
          <h2 className="text-xl font-semibold">Số lượng bác sĩ</h2>
          <p className="text-3xl font-bold">15</p>
        </div>
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-6 text-center shadow-md shadow-sky-100">
          <h2 className="text-xl font-semibold">Lịch hẹn trong tháng</h2>
          <p className="text-3xl font-bold">320</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/90 p-6 shadow-md shadow-sky-100">
        <h2 className="text-xl font-semibold mb-2">Hoạt động gần đây</h2>
        <ul>
          <li className="border-b py-2">Bác sĩ A đã cập nhật bệnh án cho bệnh nhân X.</li>
          <li className="border-b py-2">Bệnh nhân Y vừa đặt lịch hẹn.</li>
          {/* Thêm logic */}
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
