import React from 'react';

const DoctorDashboard = ({ user }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bảng điều khiển của Bác sĩ</h1>
      <p className="mb-6">Xin chào, Bác sĩ {user?.name}!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lịch hẹn hôm nay */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-6 shadow-md shadow-sky-100">
          <h2 className="text-xl font-semibold mb-2">Lịch hẹn hôm nay</h2>
          <ul>
            <li className="border-b py-2">
              <p><strong>8:00 AM</strong> - Nguyễn Văn A - Khám tổng quát</p>
            </li>
            <li className="border-b py-2">
              <p><strong>9:30 AM</strong> - Trần Thị B - Tái khám</p>
            </li>
            {/* Thêm logic hiển thị */}
          </ul>
        </div>

        {/* Thống kê nhanh */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-6 shadow-md shadow-sky-100">
          <h2 className="text-xl font-semibold mb-2">Thống kê nhanh</h2>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-3xl font-bold">12</p>
              <p>Lịch hẹn hôm nay</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">5</p>
              <p>Bệnh nhân đã khám</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
