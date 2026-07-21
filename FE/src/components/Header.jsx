import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../services/api';

const BrandMark = () => (
  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-white/40">
    <div className="absolute h-6 w-2 rounded-full bg-blue-600" />
    <div className="absolute h-2 w-6 rounded-full bg-blue-600" />
    <div className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />
  </div>
);

const canReceiveNotifications = (user) => {
  const role = String(user?.role || '').toUpperCase();
  return role.includes('PATIENT') || role.includes('DOCTOR') || role.includes('ADMIN');
};

const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  });
};

const NotificationBell = ({ user }) => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const enabled = canReceiveNotifications(user);

  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    let alive = true;
    const load = async () => {
      try {
        const [items, count] = await Promise.all([
          getMyNotifications(),
          getUnreadNotificationCount(),
        ]);
        if (!alive) return;
        setNotifications(items);
        setUnreadCount(Number(count || 0));
      } catch {
        if (!alive) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    load();
    const timer = window.setInterval(load, 30000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [enabled, user?.userId]);

  useEffect(() => {
    if (!open) return undefined;

    const handleOutsideClick = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [open]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [items, count] = await Promise.all([
        getMyNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(items);
      setUnreadCount(Number(count || 0));
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) {
      await refresh();
    }
  };

  const handleItemClick = async (notification) => {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.notificationId);
        setNotifications((current) =>
          current.map((item) =>
            item.notificationId === notification.notificationId
              ? { ...item, read: true, readAt: new Date().toISOString() }
              : item
          )
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // Người dùng vẫn có thể mở trang liên quan nếu đánh dấu đã đọc lỗi tạm thời.
      }
    }

    setOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      const now = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, read: true, readAt: now })));
      setUnreadCount(0);
    } catch {
      // Không chặn dropdown nếu thao tác đánh dấu đọc thất bại.
    }
  };

  if (!enabled) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 transition hover:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Thông báo"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold leading-none text-white ring-2 ring-blue-600">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white text-gray-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-gray-900">Thông báo</p>
              <p className="text-xs text-gray-500">{unreadCount} chưa đọc</p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
              >
                <CheckCircleIcon className="h-4 w-4" />
                Đã đọc
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Đang tải thông báo...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-500">Chưa có thông báo mới</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.notificationId}
                  type="button"
                  onClick={() => handleItemClick(notification)}
                  className={`w-full border-b border-gray-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50 ${
                    notification.read ? 'bg-white' : 'bg-blue-50/70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${notification.read ? 'bg-gray-300' : 'bg-blue-600'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <span className="shrink-0 text-[11px] text-gray-400">
                          {formatNotificationTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

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
                <NotificationBell user={user} />
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