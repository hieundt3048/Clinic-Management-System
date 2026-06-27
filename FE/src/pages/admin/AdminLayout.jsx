import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  BuildingOffice2Icon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';
import { clearAuth } from '../../services/api';

const NAV = [
  { href: '/admin',          label: 'Doanh thu',      icon: ChartBarIcon },
  { href: '/admin/appointments', label: 'Lịch hẹn',   icon: CalendarDaysIcon },
  { href: '/admin/invoices', label: 'Hóa đơn',         icon: CurrencyDollarIcon },
  { href: '/admin/staff',    label: 'Nhân viên',        icon: UsersIcon },
  { href: '/admin/users',    label: 'Tài khoản',      icon: UsersIcon },
  { href: '/admin/system-monitor', label: 'Giám sát', icon: ServerStackIcon },
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-blue-700">
        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center">
          <BuildingOffice2Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm">An Khang Care</p>
          <p className="text-blue-200 text-xs">Quản trị hệ thống</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-blue-700 shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-56 bg-blue-700 flex flex-col">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-800">
            {NAV.find(n => n.href === location.pathname)?.label || 'Quản trị'}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
