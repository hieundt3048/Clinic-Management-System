import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import {
  getAppointmentHistory,
  getMyFollowUpReminders,
  getStoredUser,
} from '../services/api';
import {
  ArrowPathIcon,
  BellAlertIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  FunnelIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'appointment', label: 'Lịch hẹn' },
  { value: 'follow-up', label: 'Tái khám' },
  { value: 'unread', label: 'Chưa đọc' },
];

const DAYS_OPTIONS = [
  { value: 7, label: '7 ngày tới' },
  { value: 14, label: '14 ngày tới' },
  { value: 30, label: '30 ngày tới' },
];

const READ_STORAGE_KEY = 'appointmentNotificationReads';

const toDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatDateTime = (value) => {
  const date = toDate(value);
  if (!date) return '--';
  return date.toLocaleString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const daysBetween = (value) => {
  const date = toDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
};

const getRelativeLabel = (value) => {
  const diff = daysBetween(value);
  if (diff === null) return 'Chưa có thời gian';
  if (diff < 0) return 'Đã quá hạn';
  if (diff === 0) return 'Hôm nay';
  if (diff === 1) return 'Ngày mai';
  return `Còn ${diff} ngày`;
};

const readSetFromStorage = () => {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

const saveReadSet = (set) => {
  localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...set]));
};

const makeAppointmentNotice = (appointment) => ({
  id: `appointment-${appointment.appointmentId}`,
  type: 'appointment',
  title: appointment.followUp ? 'Lịch tái khám sắp tới' : 'Lịch hẹn kham sap toi',
  detail: appointment.reason || 'Vui lòng đến đúng giờ và mang theo hồ sơ cần thiết.',
  occursAt: appointment.appointmentDate,
  doctorName: appointment.doctorName,
  specialtyName: appointment.specialtyName,
  roomNumber: appointment.roomNumber,
  status: appointment.status,
});

const makeFollowUpNotice = (reminder) => ({
  id: `follow-up-${reminder.kind}-${reminder.referenceId}`,
  type: 'follow-up',
  title: reminder.title || 'Nhắc tái khám',
  detail: reminder.detail || 'Bạn có lịch tái khám cần theo dõi.',
  occursAt: reminder.occursAt,
  doctorName: reminder.doctorName,
  specialtyName: '',
  roomNumber: '',
  status: reminder.kind,
});

const NoticeCard = ({ item, read, onMarkRead }) => {
  const isFollowUp = item.type === 'follow-up';

  return (
    <article className={`border rounded-xl bg-white p-4 shadow-sm transition ${read ? 'border-gray-200' : 'border-blue-200 ring-1 ring-blue-100'}`}>
      <div className="flex items-start gap-4">
        <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${isFollowUp ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
          {isFollowUp ? <BellAlertIcon className="h-6 w-6" /> : <CalendarDaysIcon className="h-6 w-6" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
            {!read && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                Mới
              </span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${isFollowUp ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'}`}>
              {isFollowUp ? 'Tái khám' : 'Lịch hẹn'}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-600">{item.detail}</p>

          <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-gray-400" />
              <span>{formatDateTime(item.occursAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span>{item.doctorName ? `BS. ${item.doctorName}` : 'Chưa có bác sĩ'}</span>
            </div>
            {item.specialtyName && (
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
                <span>{item.specialtyName}</span>
              </div>
            )}
            {item.roomNumber && (
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                <span>Phòng {item.roomNumber}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
            {getRelativeLabel(item.occursAt)}
          </span>
          {!read && (
            <button
              type="button"
              onClick={() => onMarkRead(item.id)}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Đã đọc
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

const AppointmentNotificationsPage = () => {
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState(() => readSetFromStorage());
  const [daysAhead, setDaysAhead] = useState(14);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  const loadNotifications = async () => {
    if (!patientId) {
      setError('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [appointmentsRaw, followUpsRaw] = await Promise.all([
        getAppointmentHistory(patientId).catch((err) => {
          if (err.response?.status === 404) return [];
          throw err;
        }),
        getMyFollowUpReminders(daysAhead).catch((err) => {
          if (err.response?.status === 404) return [];
          throw err;
        }),
      ]);

      const now = new Date();
      const end = new Date();
      end.setDate(end.getDate() + Number(daysAhead));
      end.setHours(23, 59, 59, 999);

      const appointmentNotices = (Array.isArray(appointmentsRaw) ? appointmentsRaw : [])
        .filter((appointment) => ['PENDING', 'CONFIRMED'].includes(appointment.status))
        .filter((appointment) => {
          const date = toDate(appointment.appointmentDate);
          return date && date >= now && date <= end;
        })
        .map(makeAppointmentNotice);

      const followUpNotices = (Array.isArray(followUpsRaw) ? followUpsRaw : [])
        .map(makeFollowUpNotice);

      const merged = [...appointmentNotices, ...followUpNotices]
        .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
        .sort((a, b) => toDate(a.occursAt) - toDate(b.occursAt));

      setItems(merged);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông báo lịch hẹn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [patientId, daysAhead]);

  const stats = useMemo(() => ({
    total: items.length,
    unread: items.filter((item) => !readIds.has(item.id)).length,
    appointments: items.filter((item) => item.type === 'appointment').length,
    followUps: items.filter((item) => item.type === 'follow-up').length,
  }), [items, readIds]);

  const visibleItems = useMemo(() => {
    if (filter === 'unread') return items.filter((item) => !readIds.has(item.id));
    if (filter === 'appointment') return items.filter((item) => item.type === 'appointment');
    if (filter === 'follow-up') return items.filter((item) => item.type === 'follow-up');
    return items;
  }, [filter, items, readIds]);

  const markRead = (id) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadSet(next);
      return next;
    });
  };

  const markAllRead = () => {
    setReadIds((prev) => {
      const next = new Set(prev);
      items.forEach((item) => next.add(item.id));
      saveReadSet(next);
      return next;
    });
  };

  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Thông báo</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Lịch hẹn kham va nhac tai kham</h1>
            <p className="mt-1 text-sm text-gray-500">
              Theo dõi các lịch hẹn sắp tới và nhắc tái khám trong khoảng thời gian bạn chọn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={daysAhead}
              onChange={(event) => setDaysAhead(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              {DAYS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={loadNotifications}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowPathIcon className="h-4 w-4" />
              Làm mới
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          {[
            { label: 'Tổng thông báo', value: stats.total, color: 'text-gray-900', bg: 'bg-gray-50' },
            { label: 'Chưa đọc', value: stats.unread, color: 'text-blue-700', bg: 'bg-blue-50' },
            { label: 'Lịch hẹn', value: stats.appointments, color: 'text-sky-700', bg: 'bg-sky-50' },
            { label: 'Tái khám', value: stats.followUps, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border border-gray-100 ${stat.bg} px-4 py-3`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  filter === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={!items.length || stats.unread === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        {loading && (
          <div className="flex justify-center rounded-xl border border-gray-200 bg-white py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && visibleItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <BellAlertIcon className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-3 text-base font-semibold text-gray-900">Chưa có thông báo phù hợp</h2>
            <p className="mt-1 text-sm text-gray-500">
              Khi có lịch hẹn sắp tới hoặc nhắc tái khám, thông tin sẽ xuất hiện tại đây.
            </p>
            <Link
              to="/appointment-history"
              className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Xem lịch sử đặt khám
            </Link>
          </div>
        )}

        {!loading && !error && visibleItems.length > 0 && (
          <div className="space-y-3">
            {visibleItems.map((item) => (
              <NoticeCard
                key={item.id}
                item={item}
                read={readIds.has(item.id)}
                onMarkRead={markRead}
              />
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default AppointmentNotificationsPage;