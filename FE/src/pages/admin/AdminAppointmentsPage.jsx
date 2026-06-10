import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { getAllAppointments, adminCreateInvoice, getExamServices, updateAppointmentStatus } from '../../services/api';
import {
  CalendarDaysIcon, ClockIcon, MagnifyingGlassIcon,
  FunnelIcon, ArrowPathIcon, ExclamationCircleIcon, CheckCircleIcon,
  CurrencyDollarIcon, XMarkIcon, ChevronDownIcon, PhoneIcon,
  UserIcon, CheckIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtTime = (s) => s ? new Date(s).toLocaleTimeString('vi-VN', { hour:'2-digit', minute:'2-digit' }) : '—';
const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n||0);

const STATUS_CFG = {
  PENDING:   { label:'Chờ xác nhận', color:'bg-yellow-100 text-yellow-700 border-yellow-200', dot:'bg-yellow-400' },
  CONFIRMED: { label:'Đã xác nhận',  color:'bg-blue-100 text-blue-700 border-blue-200',       dot:'bg-blue-500' },
  COMPLETED: { label:'Hoàn thành',   color:'bg-green-100 text-green-700 border-green-200',    dot:'bg-green-500' },
  CANCELLED: { label:'Đã hủy',       color:'bg-red-100 text-red-700 border-red-200',          dot:'bg-red-400' },
};
const getCfg = (k) => STATUS_CFG[k] || STATUS_CFG.PENDING;

const StatusBadge = ({ status }) => {
  const c = getCfg(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
};

// ─── Status transitions ───────────────────────────────────────────────────────
// Các bước chuyển trạng thái hợp lệ
const NEXT_STATUS = {
  PENDING:   { value: 'CONFIRMED', label: 'Xác nhận',   color: 'text-blue-600 border-blue-200 hover:bg-blue-50' },
  CONFIRMED: { value: 'COMPLETED', label: 'Hoàn thành', color: 'text-green-600 border-green-200 hover:bg-green-50' },
};

// ─── Invoice Modal ─────────────────────────────────────────────────────────────

const InvoiceModal = ({ appt, services, onCreated, onClose }) => {
  // Tự động tìm giá dịch vụ mặc định (khám chuyên khoa tiêu chuẩn)
  const defaultService = services.find(s =>
    s.serviceName?.toLowerCase().includes('tiêu chuẩn') ||
    s.serviceName?.toLowerCase().includes('chuyên khoa')
  ) || services[0];

  const [selectedServiceId, setSelectedServiceId] = useState(defaultService?.serviceId || '');
  const [customAmount, setCustomAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const selectedService = services.find(s => s.serviceId === Number(selectedServiceId));
  const finalAmount = customAmount ? Number(customAmount) : (selectedService?.basePrice || 0);

  const handleSubmit = async () => {
    if (!finalAmount || finalAmount <= 0) { setError('Vui lòng chọn dịch vụ hoặc nhập số tiền'); return; }
    setSaving(true); setError('');
    try {
      await adminCreateInvoice({ appointmentId: appt.appointmentId, totalAmount: finalAmount });
      onCreated();
    } catch (e) {
      setError(e.response?.data?.message || 'Tạo hóa đơn thất bại.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Tạo hóa đơn</h3>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Thông tin lịch hẹn */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
            <p className="font-semibold text-gray-700 mb-1">Lịch hẹn #{appt.appointmentId}</p>
            <div className="flex items-center gap-2 text-gray-600">
              <UserIcon className="h-3.5 w-3.5 text-gray-400" />
              {appt.patientName}
              {appt.patientPhone && (
                <a href={`tel:${appt.patientPhone}`} className="flex items-center gap-1 text-blue-600 hover:underline ml-1">
                  <PhoneIcon className="h-3.5 w-3.5" />{appt.patientPhone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
              BS. {appt.doctorName} — {appt.specialtyName}
            </div>
            <div className="flex items-center gap-2 text-gray-500">
              <ClockIcon className="h-3.5 w-3.5 text-gray-400" />
              {fmtDate(appt.appointmentDate)} lúc {fmtTime(appt.appointmentDate)}
            </div>
          </div>

          {/* Chọn dịch vụ */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dịch vụ khám</label>
              <div className="space-y-2">
                {services.map(s => (
                  <button key={s.serviceId} onClick={() => { setSelectedServiceId(s.serviceId); setCustomAmount(''); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border-2 text-sm transition ${
                      selectedServiceId === s.serviceId
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <span className={`font-medium ${selectedServiceId === s.serviceId ? 'text-blue-700' : 'text-gray-700'}`}>
                      {s.serviceName}
                    </span>
                    <span className={`font-bold ${selectedServiceId === s.serviceId ? 'text-blue-600' : 'text-gray-600'}`}>
                      {fmtCurrency(s.basePrice)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tuỳ chỉnh số tiền */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hoặc nhập số tiền khác (tuỳ chỉnh)
            </label>
            <input
              type="number"
              value={customAmount}
              onChange={e => { setCustomAmount(e.target.value); setSelectedServiceId(''); }}
              placeholder="Nhập số tiền..."
              min="0"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tổng tiền */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 flex items-center justify-between border border-blue-100">
            <span className="text-sm font-semibold text-blue-700">Tổng tiền hóa đơn</span>
            <span className="text-xl font-bold text-blue-700">{fmtCurrency(finalAmount)}</span>
          </div>

          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <ExclamationCircleIcon className="h-4 w-4" />{error}
            </p>
          )}
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} disabled={saving || !finalAmount}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang tạo...' : `Tạo hóa đơn ${finalAmount ? fmtCurrency(finalAmount) : ''}`}
          </button>
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">Hủy</button>
        </div>
      </div>
    </div>
  );
};

// ─── AppointmentRow ───────────────────────────────────────────────────────────

const AppointmentRow = ({ appt, onStatusChange, onCreateInvoice, updating }) => {
  const [expanded, setExpanded] = useState(false);
  const next = NEXT_STATUS[appt.status];

  return (
    <>
      <tr className={`hover:bg-gray-50 transition ${expanded ? 'bg-blue-50/30' : ''}`}>
        <td className="px-4 py-3 text-sm font-medium text-gray-500">#{appt.appointmentId}</td>
        <td className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-800">{appt.patientName}</p>
          {appt.patientPhone && (
            <a href={`tel:${appt.patientPhone}`}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5">
              <PhoneIcon className="h-3 w-3" />{appt.patientPhone}
            </a>
          )}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">BS. {appt.doctorName}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{appt.specialtyName}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <CalendarDaysIcon className="h-3.5 w-3.5 text-gray-400" />
            {fmtDate(appt.appointmentDate)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <ClockIcon className="h-3 w-3" />
            {fmtTime(appt.appointmentDate)}
          </div>
        </td>
        <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Nút đổi trạng thái */}
            {next && (
              <button
                onClick={() => onStatusChange(appt.appointmentId, next.value)}
                disabled={updating === appt.appointmentId}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition ${next.color} disabled:opacity-50`}
              >
                {updating === appt.appointmentId
                  ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
                  : <CheckIcon className="h-3.5 w-3.5" />
                }
                {next.label}
              </button>
            )}
            {/* Nút tạo HĐ */}
            {appt.status === 'COMPLETED' && (
              <button
                onClick={() => onCreateInvoice(appt)}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
              >
                <CurrencyDollarIcon className="h-3.5 w-3.5" />
                Tạo HĐ
              </button>
            )}
          </div>
        </td>
        <td className="px-3 py-3">
          <button onClick={() => setExpanded(v => !v)} className="p-1 rounded hover:bg-gray-200 transition">
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </td>
      </tr>

      {/* Expanded detail */}
      {expanded && (
        <tr className="bg-blue-50/20">
          <td colSpan={8} className="px-6 py-3 border-b border-blue-100">
            <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
              <span className="text-gray-500">Phòng: <span className="font-medium text-gray-800">{appt.roomNumber || '—'}</span></span>
              <span className="text-gray-500">Lý do: <span className="font-medium text-gray-800">{appt.reason || '—'}</span></span>
              <span className="text-gray-500">Tái khám: <span className="font-medium text-gray-800">{appt.followUp ? 'Có' : 'Không'}</span></span>
              <span className="text-gray-500">Mã BN: <span className="font-medium text-gray-800">{appt.patientId}</span></span>
              {appt.patientPhone && (
                <a href={`tel:${appt.patientPhone}`} className="flex items-center gap-1 text-blue-600 font-medium hover:underline">
                  <PhoneIcon className="h-3.5 w-3.5" />Gọi xác nhận: {appt.patientPhone}
                </a>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING',   label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const AdminAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [invoiceTarget, setInvoiceTarget] = useState(null);
  const [updating, setUpdating]         = useState(null); // appointmentId đang update
  const [toast, setToast]               = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [apptData, svcData] = await Promise.allSettled([
          getAllAppointments(),
          getExamServices(),
        ]);
        if (apptData.status === 'fulfilled')
          setAppointments(Array.isArray(apptData.value) ? apptData.value : []);
        if (svcData.status === 'fulfilled')
          setServices(Array.isArray(svcData.value) ? svcData.value : []);
      } catch (e) {
        setError(e.response?.data?.message || 'Không thể tải dữ liệu.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      // PATCH /api/appointments/{id}/status?status=CONFIRMED|COMPLETED
      await updateAppointmentStatus(id, newStatus);
      setAppointments(prev =>
        prev.map(a => a.appointmentId === id ? { ...a, status: newStatus } : a)
      );
      const label = newStatus === 'CONFIRMED' ? 'Đã xác nhận lịch hẹn!' : 'Đã đánh dấu hoàn thành!';
      showToast(label);
    } catch (e) {
      // BE chưa có endpoint → thông báo cho biết
      if (e.response?.status === 404 || e.response?.status === 405) {
        showToast('BE chưa có endpoint cập nhật trạng thái. Xem hướng dẫn bên dưới.', 'error');
      } else {
        showToast(e.response?.data?.message || 'Cập nhật thất bại.', 'error');
      }
    } finally { setUpdating(null); }
  };

  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchStatus = !statusFilter || a.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        a.patientName?.toLowerCase().includes(q) ||
        a.doctorName?.toLowerCase().includes(q) ||
        a.specialtyName?.toLowerCase().includes(q) ||
        String(a.appointmentId).includes(q);
      return matchStatus && matchSearch;
    });
  }, [appointments, statusFilter, search]);

  const stats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === 'PENDING').length,
    confirmed: appointments.filter(a => a.status === 'CONFIRMED').length,
    completed: appointments.filter(a => a.status === 'COMPLETED').length,
  }), [appointments]);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900">Quản lý lịch hẹn</h2>

        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Tổng',          value: stats.total,     color: 'text-gray-800',   bg: 'bg-gray-50' },
              { label: 'Chờ xác nhận',  value: stats.pending,   color: 'text-yellow-700', bg: 'bg-yellow-50' },
              { label: 'Đã xác nhận',   value: stats.confirmed, color: 'text-blue-700',   bg: 'bg-blue-50' },
              { label: 'Hoàn thành',    value: stats.completed, color: 'text-green-700',  bg: 'bg-green-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-gray-100`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast.msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {toast.type === 'error'
              ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
              : <CheckCircleIcon className="h-5 w-5 shrink-0" />
            }
            {toast.msg}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm bệnh nhân, bác sĩ, chuyên khoa..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
              {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-400">
              Hiển thị {filtered.length} / {appointments.length} lịch hẹn
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Mã</th>
                    <th className="px-4 py-3 font-semibold">Bệnh nhân</th>
                    <th className="px-4 py-3 font-semibold">Bác sĩ</th>
                    <th className="px-4 py-3 font-semibold">Chuyên khoa</th>
                    <th className="px-4 py-3 font-semibold">Ngày giờ</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">Thao tác</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-12 text-gray-400 text-sm">Không có lịch hẹn nào</td></tr>
                  ) : filtered.map(a => (
                    <AppointmentRow
                      key={a.appointmentId}
                      appt={a}
                      onStatusChange={handleStatusChange}
                      onCreateInvoice={setInvoiceTarget}
                      updating={updating}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BE note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-1">
          <p className="font-semibold">⚠️ Cần bổ sung BE để nút "Xác nhận" / "Hoàn thành" hoạt động:</p>
          <p>Thêm endpoint vào <code className="bg-amber-100 px-1 rounded">AppointmentController.java</code>:</p>
          <pre className="bg-amber-100 rounded p-2 mt-1 overflow-x-auto font-mono text-xs">{`@PatchMapping("/{id}/status")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<String>> updateStatus(
    @PathVariable Integer id,
    @RequestParam String status) {
  appointmentService.updateStatus(id,
    Appointment.AppointmentStatus.valueOf(status));
  return ResponseEntity.ok(
    new ApiResponse<>(true, "Cập nhật thành công", null));
}`}</pre>
        </div>
      </div>

      {invoiceTarget && (
        <InvoiceModal
          appt={invoiceTarget}
          services={services}
          onCreated={() => { setInvoiceTarget(null); showToast('Tạo hóa đơn thành công!'); }}
          onClose={() => setInvoiceTarget(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminAppointmentsPage;
