import React from 'react';
import { PhoneIcon, EnvelopeIcon, UserIcon, CalendarIcon, MapPinIcon, HeartIcon, BeakerIcon, FireIcon } from '@heroicons/react/24/outline';
import { ArrowDownTrayIcon } from '@heroicons/react/24/solid';

const HealthMetricCard = ({ icon, title, value, unit, color }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value} <span className="text-sm font-normal">{unit}</span></p>
    </div>
  </div>
);

const MedicalHistory = () => {
  const patient = {
    name: 'Nguyễn Văn A',
    gender: 'Nam',
    age: 28,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    phone: '0123 456 789',
    email: 'nguyenvan.a@email.com',
    patientId: 'BN2305041',
    bloodType: 'O+',
    dob: '15/05/1996',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    registrationDate: '20/05/2026',
    managingDoctor: {
      name: 'BS. Trần Minh Đức',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    }
  };

  const healthMetrics = [
    { title: 'Nhịp tim', value: '72', unit: 'bpm', icon: <HeartIcon className="h-6 w-6 text-red-500" />, color: 'bg-red-100' },
    { title: 'Huyết áp', value: '120/80', unit: 'mmHg', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>, color: 'bg-red-100' },
    { title: 'BMI', value: '21.4', unit: '', icon: <BeakerIcon className="h-6 w-6 text-green-500" />, color: 'bg-green-100' },
    { title: 'Nhiệt độ', value: '36.6', unit: '°C', icon: <FireIcon className="h-6 w-6 text-orange-500" />, color: 'bg-orange-100' },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lịch sử bệnh án</h1>
            <p className="text-gray-500">Theo dõi lịch sử khám chữa bệnh và thông tin sức khỏe của bạn</p>
          </div>
          <button className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Tải hồ sơ sức khỏe
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Info Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col sm:flex-row items-start">
              <div className="flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <img className="h-24 w-24 rounded-full" src={patient.avatar} alt="Patient Avatar" />
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-gray-800">{patient.name}</h2>
                  <span className="ml-2 text-blue-500">
                    {patient.gender === 'Nam' ? '♂' : '♀'}
                  </span>
                </div>
                <p className="text-gray-500">Nam - {patient.age} tuổi</p>
                <div className="mt-4 space-y-2 text-sm">
                  <p className="flex items-center text-gray-600"><PhoneIcon className="h-4 w-4 mr-2 text-gray-400" /> {patient.phone}</p>
                  <p className="flex items-center text-gray-600"><EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" /> {patient.email}</p>
                </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6 text-sm text-gray-600 space-y-3">
                <div className="flex justify-between"><span className="font-medium text-gray-500">Ngày sinh</span><span className="text-right">{patient.dob}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Địa chỉ</span><span className="text-right">{patient.address}</span></div>
                <div className="flex justify-between"><span className="font-medium text-gray-500">Ngày đăng ký</span><span className="text-right">{patient.registrationDate}</span></div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-500">Bác sĩ quản lý</span>
                  <div className="flex items-center">
                    <img className="h-6 w-6 rounded-full mr-2" src={patient.managingDoctor.avatar} alt="Doctor Avatar" />
                    <span>{patient.managingDoctor.name}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t mt-6 pt-4 text-sm text-gray-600 space-y-2">
                <p><span className="font-medium text-gray-500">Mã bệnh nhân:</span> {patient.patientId}</p>
                <p><span className="font-medium text-gray-500">Nhóm máu:</span> {patient.bloodType}</p>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Chỉ số sức khỏe gần nhất</h3>
              <a href="#" className="text-sm text-blue-500 hover:underline">Xem tất cả</a>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {healthMetrics.map((metric, index) => (
                <HealthMetricCard key={index} {...metric} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
