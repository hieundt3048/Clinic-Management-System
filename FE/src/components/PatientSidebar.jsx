import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarIcon,
  ClockIcon,
  UserCircleIcon,
  BellIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/appointments', label: 'Đặt lịch khám', icon: CalendarIcon },
  { to: '/appointment-history', label: 'Lịch sử đặt khám', icon: ClockIcon },
  { to: '/health-profile', label: 'Hồ sơ sức khỏe', icon: UserCircleIcon },
  { to: '/medication-reminder', label: 'Nhắc uống thuốc', icon: BellIcon },
  { to: '/medical-history', label: 'Lịch sử bệnh án', icon: DocumentTextIcon },
];

const PatientSidebar = () => {
  return (
    <aside className="w-64 min-h-[calc(100vh-5rem)] bg-white border-r border-gray-200 shrink-0">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Bệnh nhân</p>
        <h2 className="text-lg font-bold text-gray-800 mt-1">Menu chức năng</h2>
      </div>
      <nav className="p-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default PatientSidebar;
