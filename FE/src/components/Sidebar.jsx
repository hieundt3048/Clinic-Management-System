import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserCircleIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BeakerIcon,
  CurrencyDollarIcon,
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ClockIcon,
  BellAlertIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const appointmentSubItems = [
  { name: 'Đặt lịch khám', href: '/appointments', icon: CalendarIcon },
  { name: 'Thông báo lịch hẹn', href: '/appointment-notifications', icon: BellAlertIcon },
  { name: 'Lịch sử đặt khám', href: '/appointment-history', icon: ClockIcon },
  { name: 'Hồ sơ sức khỏe', href: '/health-profile', icon: UserCircleIcon },
  { name: 'Nhắc uống thuốc', href: '/medication-reminder', icon: BeakerIcon },
];

const navigation = [
  { name: 'Tổng quan', href: '/', icon: HomeIcon },
  { name: 'Hồ sơ cá nhân', href: '/user-profile', icon: UserCircleIcon },
  { name: 'Lịch hẹn khám', href: null, icon: CalendarIcon, hasDropdown: true },
  { name: 'Lịch sử bệnh án', href: '/medical-history', icon: ClipboardDocumentListIcon },
  { name: 'Đơn thuốc', href: '/prescriptions', icon: DocumentTextIcon },
  { name: 'Kết quả xét nghiệm', href: '/test-results', icon: BeakerIcon },
  { name: 'Hóa đơn & Thanh toán', href: '/billing', icon: CurrencyDollarIcon },
];

const appointmentPaths = appointmentSubItems.map(i => i.href);

const Sidebar = () => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAppointmentActive = appointmentPaths.includes(location.pathname);

  return (
    <div className="flex flex-col h-full w-64 bg-white shadow-md">
      <div className="flex flex-col flex-grow pt-5">
        <div className="px-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">QUẢN LÝ CÁ NHÂN</h2>
        </div>
        <nav className="flex-1 px-2 space-y-1 bg-white">
          {navigation.map((item) => {
            if (item.hasDropdown) {
              return (
                <div key={item.name}>
                  <button
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className={`
                      w-full text-left
                      ${isAppointmentActive ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      group flex items-center justify-between px-2 py-2 text-sm font-medium rounded-md
                    `}
                  >
                    <div className="flex items-center">
                      <item.icon
                        className={`
                          ${isAppointmentActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                          mr-3 flex-shrink-0 h-6 w-6
                        `}
                      />
                      {item.name}
                    </div>
                    <ChevronDownIcon
                      className={`h-4 w-4 transition-transform duration-200 ${dropdownOpen || isAppointmentActive ? 'rotate-180 text-blue-500' : 'text-gray-400'}`}
                    />
                  </button>

                  <div
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    className={`overflow-hidden transition-all duration-200 ${dropdownOpen || isAppointmentActive ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-blue-100 pl-3">
                      {appointmentSubItems.map((sub) => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={`
                            ${location.pathname === sub.href ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'}
                            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors
                          `}
                        >
                          <sub.icon className="h-4 w-4 shrink-0" />
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  ${location.pathname === item.href ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md
                `}
              >
                <item.icon
                  className={`
                    ${location.pathname === item.href ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                    mr-3 flex-shrink-0 h-6 w-6
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex-col border-t border-gray-200 p-4">
        <div className="p-4 bg-blue-50 rounded-lg text-center">
          <QuestionMarkCircleIcon className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <p className="text-sm font-semibold text-gray-800">Cần hỗ trợ?</p>
          <p className="text-xs text-gray-600 mb-3">Liên hệ với chúng tôi để được trợ giúp</p>
          <button className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-50">
            Liên hệ ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
