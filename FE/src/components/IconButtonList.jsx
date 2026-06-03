import React from 'react';
import { CalendarIcon, ClockIcon, UserCircleIcon, BellIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const functions = [
  { name: 'Đặt lịch khám', href: '/appointments', icon: CalendarIcon, color: 'bg-blue-500' },
  { name: 'Lịch sử khám', href: '/history', icon: ClockIcon, color: 'bg-green-500' },
  { name: 'Hồ sơ sức khỏe', href: '/health-profile', icon: UserCircleIcon, color: 'bg-yellow-500' },
  { name: 'Nhắc uống thuốc', href: '/reminders', icon: BellIcon, color: 'bg-red-500' },
];

const IconButtonList = () => {
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {functions.map((func) => (
            <Link 
              key={func.name} 
              to={func.href} 
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${func.color}`}>
                <func.icon className="h-8 w-8 text-white" />
              </div>
              <p className="mt-3 font-semibold text-gray-700">{func.name}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IconButtonList;
