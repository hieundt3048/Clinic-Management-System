import React from 'react';
import { Link } from 'react-router-dom';
import IconButtonList from './IconButtonList';
import { ArrowRightIcon, BellIcon, CalendarIcon } from '@heroicons/react/24/outline';

const PatientDashboard = ({ user }) => {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Banner Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-4xl font-bold mb-2">Chào mừng trở lại!</h1>
            <p className="text-lg">Hệ thống quản lý phòng khám luôn sẵn sàng phục vụ bạn. Hãy chăm sóc sức khỏe của mình mỗi ngày.</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột chính */}
          <div className="lg:col-span-2">
            {/* Lịch hẹn sắp tới */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Lịch hẹn sắp tới</h2>
              <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-bold">Khám chuyên khoa Tim mạch</p>
                  <p className="text-sm text-gray-600">Bác sĩ: Trần Văn An</p>
                  <p className="text-sm text-gray-600">Thời gian: 09:00 - 25/05/2026</p>
                </div>
                <Link to="/history" className="text-blue-500 hover:text-blue-700">
                  <ArrowRightIcon className="h-6 w-6" />
                </Link>
              </div>
              {/* Thêm logic hiển thị lịch hẹn ở đây */}
            </div>

            {/* Bài viết sức khỏe */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Góc sức khỏe</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img src="https://via.placeholder.com/100" alt="Health Article" className="w-24 h-24 rounded-lg object-cover" />
                  <div>
                    <h3 className="font-bold">10 lời khuyên để có một trái tim khỏe mạnh</h3>
                    <p className="text-sm text-gray-600 mt-1">Chế độ ăn uống và luyện tập hợp lý là chìa khóa cho sức khỏe tim mạch...</p>
                    <a href="#" className="text-blue-500 hover:underline text-sm mt-2 inline-block">Đọc thêm</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phụ */}
          <div>
            {/* Nhắc nhở */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Thông báo & Nhắc nhở</h2>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="bg-red-100 p-2 rounded-full"><BellIcon className="h-5 w-5 text-red-500"/></div>
                  <p className="text-sm">Đã đến giờ uống thuốc <span className="font-semibold">Paracetamol</span>.</p>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full"><CalendarIcon className="h-5 w-5 text-blue-500"/></div>
                  <p className="text-sm">Lịch tái khám của bạn là vào tuần tới. Đừng quên nhé!</p>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
