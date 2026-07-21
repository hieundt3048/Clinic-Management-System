import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getAppointmentHistory, cancelAppointment, getStoredUser } from '../services/api';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  MapPinIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const formatTime = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

// ─── Status config ─────────────────────────────────────────────────────────────
// Khớp với enum AppointmentStatus bên BE: PENDING, CONFIRMED, COMPLETED, CANCELLED

const STATUS_CONFIG = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-400',
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-700 border-red-200',
    dot: 'bg-red-400',
  },
};

const getStatusCfg = (key) =>
  STATUS_CONFIG[key] || { label: key, color: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' };

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

// ─── StatusBadge ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = getStatusCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── DetailRow ─────────────────────────────────────────────────────────────────

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2 text-sm">
    <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
    <span className="text-gray-500 w-28 shrink-0">{label}</span>
    <span className="text-gray-800 font-medium">{value || '—'}</span>
  </div>
);

// ─── AppointmentCard ───────────────────────────────────────────────────────────

/**
 * BE trả về các field theo AppointmentHistoryResponse:
 * appointmentId, appointmentDate, status, reason, followUp,
 * patientId, patientName,
 * doctorId, doctorName, roomNumber,
 * specialtyId, specialtyName
 */
const AppointmentCard = ({ appt, onCancel, cancelling }) => {
  const [expanded, setExpanded] = useState(false);

  const canCancel = appt.status === 'PENDING' || appt.status === 'CONFIRMED';
  const isFuture = new Date(appt.appointmentDate) > new Date();

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/90 shadow-md shadow-sky-100 transition-shadow hover:shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-5 gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <UserIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">
              {appt.specialtyName}
            </p>
            <h3 className="text-base font-bold text-gray-900">
              BS. {appt.doctorName}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                {formatDate(appt.appointmentDate)}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {formatTime(appt.appointmentDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={appt.status} />
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors"
          >
            {expanded ? 'Thu gọn' : 'Chi tiết'}
            <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-sky-200 bg-white/80 px-5 py-4 space-y-2.5">
          {appt.roomNumber && (
            <DetailRow icon={MapPinIcon} label="Phòng khám" value={appt.roomNumber} />
          )}
          {appt.reason && (
            <DetailRow icon={DocumentTextIcon} label="Lý do khám" value={appt.reason} />
          )}
          {appt.followUp && (
            <div className="flex items-center gap-2 text-sm">
              <ArrowPathIcon className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                Tái khám
              </span>
            </div>
          )}

          {/* Hủy lịch */}
          {canCancel && isFuture && (
            <div className="pt-2">
              <button
                onClick={() => onCancel(appt.appointmentId)}
                disabled={cancelling === appt.appointmentId}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling === appt.appointmentId ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <XMarkIcon className="h-4 w-4" />
                )}
                Hủy lịch hẹn
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AppointmentHistoryPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState('');

  // Lấy patientId từ user đang đăng nhập
const user = getStoredUser();
const patientId = user?.patientId ?? user?.userId;

  const fetchHistory = async () => {
    if (!patientId) {
      setError('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      // BE: GET /api/appointments/history/patient/{patientId}
      // Response: List<AppointmentHistoryResponse> trực tiếp (không bọc ApiResponse)
      const data = await getAppointmentHistory(patientId);
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      // BE ném ResourceNotFoundException (404) nếu không có lịch hẹn nào
      if (err.response?.status === 404) {
        setAppointments([]); // Không phải lỗi, chỉ là chưa có lịch
      } else {
        setError(
          err.response?.data?.message ||
          'Không thể tải dữ liệu. Vui lòng thử lại sau.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [patientId]);

  const handleCancel = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    setCancelling(id);
    try {
      // BE: DELETE /api/appointments/{id} → ApiResponse<String>
      await cancelAppointment(id);
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === id ? { ...a, status: 'CANCELLED' } : a))
      );
      setToast('Hủy lịch hẹn thành công!');
      setTimeout(() => setToast(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể hủy lịch hẹn. Vui lòng thử lại.');
    } finally {
      setCancelling(null);
    }
  };

  // Lọc client-side theo search + status
  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchStatus = !statusFilter || a.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.specialtyName?.toLowerCase().includes(q) ||
        a.reason?.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, statusFilter, search]);

  // Thống kê
  const stats = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter(
      (a) => ['PENDING', 'CONFIRMED'].includes(a.status) && new Date(a.appointmentDate) > new Date()
    ).length,
    completed: appointments.filter((a) => a.status === 'COMPLETED').length,
    cancelled: appointments.filter((a) => a.status === 'CANCELLED').length,
  }), [appointments]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Tiêu đề */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử đặt khám</h1>
          <p className="text-sm text-gray-500 mt-1">Xem và quản lý các lịch hẹn khám của bạn</p>
        </div>

        {/* Stats */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Tổng lịch hẹn', value: stats.total, color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Sắp tới', value: stats.upcoming, color: 'text-blue-700', bg: 'bg-blue-50' },
              { label: 'Hoàn thành', value: stats.completed, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Đã hủy', value: stats.cancelled, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-sky-200 shadow-sm`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
            {toast}
          </div>
        )}

        {/* Bộ lọc */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo bác sĩ, chuyên khoa, lý do khám..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
            >
              {FILTER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Nội dung */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/80 py-16 gap-3 text-sky-600">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/80 py-16 gap-3 text-sky-500">
            <CalendarDaysIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">
              {appointments.length === 0 ? 'Bạn chưa có lịch hẹn nào' : 'Không tìm thấy kết quả phù hợp'}
            </p>
            <p className="text-sm">
              {appointments.length === 0
                ? 'Đặt lịch khám để bắt đầu'
                : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Hiển thị {filtered.length} / {appointments.length} lịch hẹn
            </p>
            {filtered.map((appt) => (
              <AppointmentCard
                key={appt.appointmentId}
                appt={appt}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default AppointmentHistoryPage;
