import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon, DocumentTextIcon, HeartIcon,
  Bars3Icon, ArrowRightOnRectangleIcon, UserCircleIcon,
} from '@heroicons/react/24/outline';
import { clearAuth, getStoredUser } from '../../services/api';

const NAV = [
  { href: '/doctor',              label: 'Lịch hẹn',    icon: CalendarDaysIcon },
  { href: '/doctor/prescriptions',label: 'Kê đơn thuốc',icon: DocumentTextIcon },
  { href: '/doctor/patients',     label: 'Bệnh nhân',   icon: HeartIcon },
];

const DoctorLayout = ({ children }) => {
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const user = getStoredUser();

  const handleLogout = () => { clearAuth(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-teal-700">
        <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <UserCircleIcon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">BS. {user?.name || 'Bác sĩ'}</p>
          <p className="text-teal-200 text-xs truncate">{user?.email}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                active ? 'bg-white text-teal-700 shadow-sm' : 'text-teal-100 hover:bg-white/10 hover:text-white'
              }`}>
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-teal-700">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-teal-200 hover:bg-white/10 hover:text-white transition">
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 bg-teal-700 shrink-0">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-56 bg-teal-700 flex flex-col"><SidebarContent /></aside>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setOpen(true)} className="md:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <Bars3Icon className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-base font-semibold text-gray-800">
            {NAV.find(n => n.href === location.pathname)?.label || 'Bác sĩ'}
          </h1>
        </header>
        <main className="flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
