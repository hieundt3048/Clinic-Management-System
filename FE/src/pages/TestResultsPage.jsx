import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyServiceRequests, getStoredUser } from '../services/api';
import {
  ArrowPathIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const arr = (value) => (Array.isArray(value) ? value : []);
const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};
const fmtCurrency = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const STATUS_CFG = {
  PENDING: { label: 'Chờ thực hiện', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  COMPLETED: { label: 'Đã có kết quả', color: 'bg-green-50 text-green-700 border-green-200', dot: 'bg-green-500' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-400' },
};
const INVOICE_STATUS = {
  UNPAID: 'Chưa thanh toán',
  PENDING_CASH: 'Chờ xác nhận tại quầy',
  PAID: 'Đã thanh toán',
};

const FILTERS = [
  { value: '', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ thực hiện' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Đã có kết quả' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{cfg.label}
    </span>
  );
};

const ImageModal = ({ src, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
    <button onClick={onClose} className="absolute right-4 top-4 rounded-full bg-white/10 p-2 transition hover:bg-white/20">
      <XMarkIcon className="h-6 w-6 text-white" />
    </button>
    <img src={src} alt="Kết quả xét nghiệm" className="max-h-full max-w-full rounded-lg" onClick={(e) => e.stopPropagation()} />
  </div>
);

const Empty = ({ children }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 py-16 text-blue-500">
    <BeakerIcon className="h-14 w-14 text-gray-200" />
    <p className="text-base font-medium text-gray-500">{children}</p>
  </div>
);

const InfoBox = ({ label, children }) => (
  <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-2 text-sm leading-6 text-gray-800">{children || '—'}</div>
  </div>
);

const RequestCard = ({ req, onViewImage }) => {
  const images = req.resultImages ? req.resultImages.split(',').map((item) => item.trim()).filter(Boolean) : [];
  return (
    <article className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-700">Chỉ định #{req.requestId}</p>
          <h3 className="mt-1 text-lg font-bold text-gray-900">{req.serviceName || 'Dịch vụ cận lâm sàng'}</h3>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" />BS. {req.doctorName || '—'}</span>
            <span className="inline-flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDateTime(req.createdAt)}</span>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <InfoBox label="Lý do chỉ định">{req.indicationReason || '—'}</InfoBox>
        <InfoBox label="Chi phí">{fmtCurrency(req.basePrice)}</InfoBox>
        <InfoBox label="Hóa đơn">
          {req.invoiceId ? `#${req.invoiceId} · ${INVOICE_STATUS[req.invoiceStatus] || req.invoiceStatus || 'Chưa rõ'}` : 'Chưa có hóa đơn'}
        </InfoBox>
      </div>

      {req.status === 'COMPLETED' ? (
        <div className="mt-4 rounded-xl border border-green-100 bg-green-50 p-4">
          <p className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-green-700">
            <CheckCircleIcon className="h-4 w-4" />Kết quả
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-green-900">{req.resultSummary || 'Đã hoàn thành nhưng chưa có mô tả kết quả.'}</p>
          {req.performedAt && <p className="mt-3 text-xs font-semibold text-green-700">Thực hiện lúc: {fmtDateTime(req.performedAt)}</p>}
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-3 text-sm text-gray-500">
          <ClockIcon className="h-4 w-4" />
          {req.status === 'PENDING'
            ? 'Đang chờ thanh toán hoặc chờ thực hiện dịch vụ.'
            : req.status === 'IN_PROGRESS'
              ? 'Dịch vụ đang được thực hiện.'
              : 'Chỉ định này đã bị hủy.'}
        </div>
      )}

      {images.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500"><PhotoIcon className="h-4 w-4" />Hình ảnh kết quả</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {images.map((url, index) => (
              <button key={index} onClick={() => onViewImage(url)} className="aspect-square overflow-hidden rounded-lg border border-gray-200 transition hover:border-blue-400">
                <img src={url} alt={`Kết quả ${index + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

const TestResultsPage = () => {
  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [viewImage, setViewImage] = useState(null);

  const load = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      setError('Không tìm thấy mã bệnh nhân trong phiên đăng nhập.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getMyServiceRequests(patientId);
      setRequests(arr(data).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      if (err.response?.status === 404) setRequests([]);
      else setError(err.response?.data?.message || 'Không thể tải kết quả xét nghiệm.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((req) => {
      const matchFilter = !filter || req.status === filter;
      const matchSearch = !q ||
        req.serviceName?.toLowerCase().includes(q) ||
        req.doctorName?.toLowerCase().includes(q) ||
        req.indicationReason?.toLowerCase().includes(q) ||
        req.resultSummary?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [requests, filter, search]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((req) => ['PENDING', 'IN_PROGRESS'].includes(req.status)).length,
    completed: requests.filter((req) => req.status === 'COMPLETED').length,
  }), [requests]);

  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kết quả xét nghiệm</h1>
            <p className="mt-0.5 text-sm text-gray-500">Theo dõi đầy đủ chỉ định cận lâm sàng, hóa đơn liên quan và kết quả.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className="h-4 w-4" />Tải lại
          </button>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-3"><p className="text-2xl font-bold text-blue-800">{stats.total}</p><p className="text-xs font-semibold text-blue-600">Tổng</p></div>
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3"><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p><p className="text-xs font-semibold text-yellow-600">Chờ xử lý</p></div>
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3"><p className="text-2xl font-bold text-green-700">{stats.completed}</p><p className="text-xs font-semibold text-green-600">Đã có kết quả</p></div>
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo dịch vụ, bác sĩ, lý do, kết quả..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {FILTERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <Empty>{requests.length === 0 ? 'Chưa có chỉ định xét nghiệm nào' : 'Không tìm thấy kết quả phù hợp'}</Empty>}

        <div className="space-y-4">
          {filtered.map((req) => <RequestCard key={req.requestId} req={req} onViewImage={setViewImage} />)}
        </div>
      </div>

      {viewImage && <ImageModal src={viewImage} onClose={() => setViewImage(null)} />}
    </PatientLayout>
  );
};

export default TestResultsPage;