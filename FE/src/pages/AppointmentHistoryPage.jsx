import React from 'react';
import PatientLayout from '../components/PatientLayout';

const AppointmentHistoryPage = () => {
  return (
    <PatientLayout pageTitle="Lịch sử đặt khám">
      <div className="p-6">
        <p className="text-gray-600">
          Danh sách các cuộc hẹn đã qua và sắp tới sẽ được hiển thị tại đây.
        </p>
      </div>
    </PatientLayout>
  );
};

export default AppointmentHistoryPage;
