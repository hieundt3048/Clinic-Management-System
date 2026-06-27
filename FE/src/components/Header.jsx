import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

const BrandMark = () => (
  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-white/40">
    <div className="absolute h-6 w-2 rounded-full bg-blue-600" />
    <div className="absolute h-2 w-6 rounded-full bg-blue-600" />
    <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
  </div>
);

const Header = ({ user, onLogout }) => {
  return (
    <nav className="sticky top-0 z-40 border-b border-blue-100 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <BrandMark />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold tracking-wide">An Khang Care</div>
              <div className="truncate text-xs font-medium text-blue-100">Chăm sóc trọn vẹn</div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            {user ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="max-w-[220px] truncate text-sm font-semibold">{user.name || user.email || 'Người dùng'}</p>
                  <p className="text-xs text-blue-100">{user.role || 'Tài khoản'}</p>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;