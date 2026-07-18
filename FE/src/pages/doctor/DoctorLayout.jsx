import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BeakerIcon,
  HeartIcon,
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { clearAuth, getStoredUser } from '../../services/api';

const NAV = [
  { href: '/doctor', label: 'Lịch hẹn', icon: CalendarDaysIcon },
  { href: '/doctor/medical-records', label: 'Bệnh án', icon: ClipboardDocumentListIcon },
  { href: '/doctor/prescriptions', label: 'Kê đơn thuốc', icon: DocumentTextIcon },
  { href: '/doctor/service-requests', label: 'Chỉ định CLS', icon: BeakerIcon },
  { href: '/doctor/patients', label: 'Bệnh nhân', icon: HeartIcon },
];

const DoctorLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const user = getStoredUser();

  const activeItem = NAV.find((item) => item.href === location.pathname);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="border-b border-blue-700 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15 ring-1 ring-white/25">
            <ShieldCheckIcon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">An Khang Care</p>
            <p className="truncate text-xs text-blue-100">Khu vực bác sĩ</p>
          </div>
        </div>
      </div>

      <div className="border-b border-blue-700/70 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <UserCircleIcon className="h-5 w-5 text-blue-700" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">BS. {user?.name || 'Bác sĩ'}</p>
            <p className="truncate text-xs text-blue-100">{user?.email || 'Tài khoản bác sĩ'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-blue-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-blue-700 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-blue-100 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <aside className="hidden w-60 shrink-0 flex-col bg-blue-700 md:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative flex w-64 flex-col bg-blue-700">
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded-lg p-1.5 transition hover:bg-gray-100 md:hidden"
            >
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-gray-900">{activeItem?.label || 'Bác sĩ'}</h1>
              <p className="truncate text-xs text-gray-500">Quản lý khám bệnh, bệnh án, đơn thuốc và chỉ định cận lâm sàng</p>
            </div>
          </div>
          <div className="hidden rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:block">
            {user?.specialtyName || 'Phòng khám An Khang'}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-100 p-5">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
