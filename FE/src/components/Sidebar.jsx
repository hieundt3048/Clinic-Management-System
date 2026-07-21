import React from 'react';
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
  ClockIcon,
  BellAlertIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: HomeIcon },
  { name: 'Hồ sơ cá nhân', href: '/user-profile', icon: UserCircleIcon },
  { name: 'Đặt lịch khám', href: '/appointments', icon: CalendarIcon },
  { name: 'Thông báo lịch hẹn', href: '/appointment-notifications', icon: BellAlertIcon },
  { name: 'Lịch sử đặt khám', href: '/appointment-history', icon: ClockIcon },
  { name: 'Hồ sơ sức khỏe', href: '/health-profile', icon: HeartIcon },
  { name: 'Nhắc uống thuốc', href: '/medication-reminder', icon: BeakerIcon },
  { name: 'Lịch sử bệnh án', href: '/medical-history', icon: ClipboardDocumentListIcon },
  { name: 'Đơn thuốc', href: '/prescriptions', icon: DocumentTextIcon },
  { name: 'Kết quả xét nghiệm', href: '/test-results', icon: BeakerIcon },
  { name: 'Hóa đơn & Thanh toán', href: '/billing', icon: CurrencyDollarIcon },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-blue-800 via-blue-700 to-cyan-700 text-white shadow-xl">
      <div className="flex flex-grow flex-col pt-5">
        <div className="mx-4 mb-4 rounded-xl bg-white/10 px-4 py-3 ring-1 ring-white/15">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Khu vực bệnh nhân</p>
          <h2 className="mt-1 text-lg font-bold text-white">Quản lý cá nhân</h2>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-blue-50 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 shrink-0 ${
                    active ? 'text-blue-600' : 'text-blue-100 group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="shrink-0 border-t border-white/15 p-4">
        <div className="rounded-xl bg-white/10 p-4 text-center ring-1 ring-white/15">
          <QuestionMarkCircleIcon className="mx-auto mb-2 h-8 w-8 text-white" />
          <p className="text-sm font-bold text-white">Cần hỗ trợ?</p>
          <p className="mb-3 text-xs text-blue-100">Liên hệ với chúng tôi để được trợ giúp</p>
          <button className="w-full rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50">
            Liên hệ ngay
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;