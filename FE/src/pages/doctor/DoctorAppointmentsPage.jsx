import React, { useState, useEffect, useMemo } from 'react';
import DoctorLayout from './DoctorLayout';
import { getDoctorAppointments, updateAppointmentStatus, getStoredUser } from '../../services/api';
import {
  CalendarDaysIcon, ClockIcon, UserIcon, MagnifyingGlassIcon,
  FunnelIcon, ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon,
  ChevronDownIcon, PhoneIcon, CheckIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }) : '—';

const STATUS_CFG = {
  PENDING:   { label:'Chờ xác nhận', color:'bg-yellow-100 text-yellow-700 border-yellow-200', dot:'bg-yellow-400' },
  CONFIRMED: { label:'Đã xác nhận',  color:'bg-blue-100 text-blue-700 border-blue-200',       dot:'bg-blue-500'  },
  COMPLETED: { label:'Hoàn thành',   color:'bg-green-100 text-green-700 border-green-200',    dot:'bg-green-500' },
  CANCELLED: { label:'Đã hủy',       color:'bg-red-100 text-red-700 border-red-200',          dot:'bg-red-400'   },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
};

const NEXT = {
  PENDING:   { value:'CONFIRMED', label:'Xác nhận',   cls:'text-blue-600 border-blue-200 hover:bg-blue-50' },
  CONFIRMED: { value:'COMPLETED', label:'Hoàn thành', cls:'text-green-600 border-green-200 hover:bg-green-50' },
};

const AppointmentCard = ({ appt, onStatus, updating }) => {
  const [expanded, setExpanded] = useState(false);
  const next = NEXT[appt.status];
  const isToday = new Date(appt.appointmentDate).toDateString() === new Date().toDateString();

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
      isToday ? 'border-teal-200' : 'border-gray-200'
    }`}>
      {isToday && <div className="h-1 bg-gradient-to-r from-teal-500 to-teal-400" />}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
            <UserIcon className="h-5 w-5 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{appt.patientName}</p>
            {appt.patientPhone && (
              <a href={`tel:${appt.patientPhone}`}
                className="flex items-center gap-1 text-xs text-teal-600 hover:underline mt-0.5">
                <PhoneIcon className="h-3 w-3" />{appt.patientPhone}
              </a>
            )}
            <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDate(appt.appointmentDate)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-3.5 w-3.5" />{fmtTime(appt.appointmentDate)}
              </span>
              {appt.roomNumber && <span>📍 {appt.roomNumber}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={appt.status} />
          <div className="flex items-center gap-1.5">
            {next && (
              <button onClick={() => onStatus(appt.appointmentId, next.value)}
                disabled={updating === appt.appointmentId}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition ${next.cls} disabled:opacity-50`}>
                {updating === appt.appointmentId
                  ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                  : <CheckIcon className="h-3.5 w-3.5" />}
                {next.label}
              </button>
            )}
            <button onClick={() => setExpanded(v => !v)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition">
              <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-1.5 text-sm text-gray-600">
          <p><span className="text-gray-400">Chuyên khoa:</span> <span className="font-medium">{appt.specialtyName}</span></p>
          {appt.reason && <p><span className="text-gray-400">Lý do khám:</span> <span className="font-medium">{appt.reason}</span></p>}
          <p><span className="text-gray-400">Loại:</span> <span className="font-medium">{appt.followUp ? 'Tái khám' : 'Khám mới'}</span></p>
          <p><span className="text-gray-400">Mã BN:</span> <span className="font-medium">{appt.patientId}</span></p>
        </div>
      )}
    </div>
  );
};

const FILTERS = [
  { value:'', label:'Tất cả' },
  { value:'PENDING',   label:'Chờ xác nhận' },
  { value:'CONFIRMED', label:'Đã xác nhận' },
  { value:'COMPLETED', label:'Hoàn thành' },
  { value:'CANCELLED', label:'Đã hủy' },
];

const DoctorAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('');
  const [updating, setUpdating] = useState(null);
  const [toast, setToast]       = useState({ msg:'', type:'' });

  const user = getStoredUser();
  const doctorId = user?.doctorId ?? user?.userId;

  const showToast = (msg, type='success') => { setToast({msg, type}); setTimeout(() => setToast({msg:'',type:''}), 3000); };

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/appointments/history/doctor/{doctorId}
        const data = await getDoctorAppointments(doctorId);
        setAppointments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.response?.status === 404) setAppointments([]);
        else setError('Không thể tải lịch hẹn.');
      } finally { setLoading(false); }
    };
    if (doctorId) load();
  }, [doctorId]);

  const handleStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateAppointmentStatus(id, newStatus);
      setAppointments(prev => prev.map(a => a.appointmentId === id ? {...a, status: newStatus} : a));
      showToast(newStatus === 'CONFIRMED' ? 'Đã xác nhận lịch hẹn!' : 'Đã hoàn thành!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Cập nhật thất bại.', 'error');
    } finally { setUpdating(null); }
  };

  const filtered = useMemo(() => appointments.filter(a => {
    const matchFilter = !filter || a.status === filter;
    const q = search.toLowerCase();
    return matchFilter && (!q || a.patientName?.toLowerCase().includes(q) || a.reason?.toLowerCase().includes(q));
  }), [appointments, filter, search]);

  // Nhóm theo ngày
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach(a => {
      const d = new Date(a.appointmentDate).toDateString();
      if (!map[d]) map[d] = [];
      map[d].push(a);
    });
    return Object.entries(map).sort(([a],[b]) => new Date(a) - new Date(b));
  }, [filtered]);

  const stats = useMemo(() => ({
    today:   appointments.filter(a => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length,
    pending: appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
  }), [appointments]);

  return (
    <DoctorLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lịch hẹn của tôi</h2>
          <p className="text-sm text-gray-400 mt-0.5">Quản lý và xác nhận lịch hẹn khám bệnh</p>
        </div>

        {!loading && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Hôm nay',      value: stats.today,    color:'text-teal-700',   bg:'bg-teal-50' },
              { label:'Chờ xác nhận', value: stats.pending,  color:'text-yellow-700', bg:'bg-yellow-50' },
              { label:'Đã xác nhận',  value: stats.confirmed,color:'text-blue-700',   bg:'bg-blue-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-gray-100`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {toast.msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" /> : <CheckCircleIcon className="h-5 w-5 shrink-0" />}
            {toast.msg}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm bệnh nhân, lý do khám..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white appearance-none cursor-pointer">
              {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-teal-500" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}
        {!loading && !error && grouped.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <CalendarDaysIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Không có lịch hẹn nào</p>
          </div>
        )}
        {!loading && !error && grouped.map(([dateStr, appts]) => {
          const d = new Date(dateStr);
          const isToday = d.toDateString() === new Date().toDateString();
          const label = isToday ? 'Hôm nay' : d.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit' });
          return (
            <section key={dateStr} className="space-y-2">
              <h3 className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-2 ${isToday ? 'text-teal-600' : 'text-gray-400'}`}>
                {isToday && <span className="h-2 w-2 rounded-full bg-teal-500" />}
                {label} <span className="text-gray-300">({appts.length})</span>
              </h3>
              {appts.map(a => (
                <AppointmentCard key={a.appointmentId} appt={a} onStatus={handleStatus} updating={updating} />
              ))}
            </section>
          );
        })}
      </div>
    </DoctorLayout>
  );
};

export default DoctorAppointmentsPage;
