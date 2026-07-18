import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import { getDoctorAppointments, updateAppointmentStatus, getStoredUser, getMyDoctorProfile } from '../../services/api';
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CheckIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

const pad = (value) => String(value).padStart(2, '0');
const dateKey = (value) => {
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};
const timeKey = (value) => {
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
const fmtDay = (key) => new Date(`${key}T00:00:00`).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' });
const fmtFullDate = (key) => new Date(`${key}T00:00:00`).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const isTodayKey = (key) => key === dateKey(new Date());

const STATUS_CFG = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-400' },
};

const NEXT = {
  PENDING: { value: 'CONFIRMED', label: 'Xác nhận', cls: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
  CONFIRMED: { value: 'COMPLETED', label: 'Hoàn thành', cls: 'text-green-600 border-green-200 hover:bg-green-50' },
};

const FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  );
};

const ScheduleCard = ({ appt, onStatus, updating }) => {
  const next = NEXT[appt.status];
  return (
    <div className="rounded-lg border border-blue-100 bg-sky-50/90 p-3 shadow-sm ring-1 ring-blue-50">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-gray-900">{appt.patientName}</p>
          {appt.patientPhone && (
            <a href={`tel:${appt.patientPhone}`} className="mt-0.5 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <PhoneIcon className="h-3 w-3" />{appt.patientPhone}
            </a>
          )}
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div className="mt-2 space-y-1 text-xs text-gray-500">
        <p className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" />{timeKey(appt.appointmentDate)}</p>
        {appt.roomNumber && <p>Phòng {appt.roomNumber}</p>}
        {appt.reason && <p className="line-clamp-2 text-gray-600">{appt.reason}</p>}
      </div>

      {next && (
        <button
          type="button"
          onClick={() => onStatus(appt.appointmentId, next.value)}
          disabled={updating === appt.appointmentId}
          className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${next.cls} disabled:opacity-50`}
        >
          {updating === appt.appointmentId ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : <CheckIcon className="h-3.5 w-3.5" />}
          {next.label}
        </button>
      )}
    </div>
  );
};

const ScheduleTable = ({ appointments, onStatus, updating }) => {
  const days = useMemo(() => [...new Set(appointments.map((appt) => dateKey(appt.appointmentDate)))].sort(), [appointments]);
  const times = useMemo(() => [...new Set(appointments.map((appt) => timeKey(appt.appointmentDate)))].sort(), [appointments]);
  const bySlot = useMemo(() => {
    const map = new Map();
    appointments.forEach((appt) => {
      const key = `${dateKey(appt.appointmentDate)}|${timeKey(appt.appointmentDate)}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(appt);
    });
    return map;
  }, [appointments]);

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-gray-400">
        <CalendarDaysIcon className="h-14 w-14 text-gray-200" />
        <p className="text-base font-medium text-gray-500">Không có lịch hẹn nào</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-blue-200 bg-sky-100/80 shadow-sm">
      <div className="border-b border-blue-200 bg-blue-100 px-4 py-3 text-sm font-medium text-blue-800">
        Hiển thị {appointments.length} lịch hẹn theo khung giờ
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full border-separate border-spacing-0 bg-sky-50 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-blue-800">
              <th className="sticky left-0 z-20 w-24 border-b border-r border-blue-600 bg-blue-700 px-4 py-3 font-semibold text-white">Giờ</th>
              {days.map((day) => (
                <th key={day} className={`min-w-[210px] border-b border-r border-blue-200 px-4 py-3 font-semibold ${isTodayKey(day) ? 'bg-blue-200 text-blue-900' : 'bg-sky-100 text-blue-800'}`}>
                  <div>{fmtDay(day)}</div>
                  <div className="mt-0.5 text-[11px] font-normal normal-case text-gray-400">{fmtFullDate(day)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time} className="align-top">
                <td className="sticky left-0 z-10 border-b border-r border-blue-500 bg-blue-600 px-4 py-4 text-sm font-semibold text-white">{time}</td>
                {days.map((day) => {
                  const items = bySlot.get(`${day}|${time}`) || [];
                  return (
                    <td key={`${day}-${time}`} className={`h-28 border-b border-r border-blue-100 p-3 ${isTodayKey(day) ? 'bg-blue-100/80' : 'bg-sky-50/90'}`}>
                      {items.length > 0 ? (
                        <div className="space-y-2">
                          {items.map((appt) => <ScheduleCard key={appt.appointmentId} appt={appt} onStatus={onStatus} updating={updating} />)}
                        </div>
                      ) : (
                        <div className="h-full rounded-lg border border-dashed border-blue-200 bg-sky-100/70" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const storedUser = getStoredUser();
        let doctorId = storedUser?.doctorId;
        if (!doctorId) {
          const profile = await getMyDoctorProfile();
          doctorId = profile.doctorId;
          const stored = getStoredUser();
          if (stored) localStorage.setItem('user', JSON.stringify({ ...stored, doctorId }));
        }
        const data = await getDoctorAppointments(doctorId);
        setAppointments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.response?.status === 404) setAppointments([]);
        else setError('Không thể tải lịch hẹn. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments((prev) => prev.map((appt) => appt.appointmentId === id ? { ...appt, status: newStatus } : appt));
      showToast(newStatus === 'CONFIRMED' ? 'Đã xác nhận lịch hẹn!' : 'Đã hoàn thành lịch hẹn!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Cập nhật thất bại.', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(() => appointments
    .filter((appt) => {
      const matchFilter = !filter || appt.status === filter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q
        || appt.patientName?.toLowerCase().includes(q)
        || appt.patientPhone?.toLowerCase().includes(q)
        || appt.reason?.toLowerCase().includes(q)
        || appt.roomNumber?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    })
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)), [appointments, filter, search]);

  const stats = useMemo(() => ({
    today: appointments.filter((appt) => isTodayKey(dateKey(appt.appointmentDate))).length,
    pending: appointments.filter((appt) => appt.status === 'PENDING').length,
    confirmed: appointments.filter((appt) => appt.status === 'CONFIRMED').length,
    completed: appointments.filter((appt) => appt.status === 'COMPLETED').length,
  }), [appointments]);

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lịch hẹn của tôi</h2>
          <p className="mt-0.5 text-sm text-gray-400">Bảng lịch theo ngày và khung giờ khám</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { label: 'Hôm nay', value: stats.today, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Chờ xác nhận', value: stats.pending, color: 'text-yellow-700', bg: 'bg-yellow-50' },
              { label: 'Đã xác nhận', value: stats.confirmed, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Hoàn thành', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
            ].map((item) => (
              <div key={item.label} className={`${item.bg} rounded-xl border border-gray-100 px-4 py-3`}>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="mt-0.5 text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        )}

        {toast.msg && (
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm ${toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
            {toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" /> : <CheckCircleIcon className="h-5 w-5 shrink-0" />}
            {toast.msg}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm bệnh nhân, số điện thoại, lý do khám..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FILTERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}
        {!loading && !error && <ScheduleTable appointments={filtered} onStatus={handleStatus} updating={updating} />}
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointmentsPage;
