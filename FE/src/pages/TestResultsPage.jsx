import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyServiceRequests, getStoredUser } from '../services/api';
import {
  BeakerIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon,
  ExclamationCircleIcon, ChevronDownIcon, CalendarDaysIcon,
  UserIcon, PhotoIcon, CheckCircleIcon, ClockIcon, XMarkIcon,
} from '@heroicons/react/24/outline';

const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '—';
const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n||0);

const STATUS_CFG = {
  PENDING:     { label:'Chờ thực hiện', color:'bg-yellow-100 text-yellow-700 border-yellow-200', dot:'bg-yellow-400' },
  IN_PROGRESS: { label:'Đang thực hiện',color:'bg-blue-100 text-blue-700 border-blue-200',       dot:'bg-blue-500'  },
  COMPLETED:   { label:'Đã có kết quả', color:'bg-green-100 text-green-700 border-green-200',    dot:'bg-green-500' },
  CANCELLED:   { label:'Đã hủy',        color:'bg-red-100 text-red-700 border-red-200',          dot:'bg-red-400'   },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
};

// Modal xem ảnh phóng to
const ImageModal = ({ src, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={onClose}>
    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition">
      <XMarkIcon className="h-6 w-6 text-white" />
    </button>
    <img src={src} alt="Kết quả xét nghiệm" className="max-w-full max-h-full rounded-lg" onClick={e => e.stopPropagation()} />
  </div>
);

const RequestCard = ({ req, onViewImage }) => {
  const [expanded, setExpanded] = useState(false);
  const images = req.resultImages
    ? req.resultImages.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full p-4 flex items-start justify-between gap-3 text-left">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${req.status === 'COMPLETED' ? 'bg-green-100' : 'bg-blue-100'}`}>
            <BeakerIcon className={`h-5 w-5 ${req.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{req.serviceName}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <UserIcon className="h-3 w-3" />BS. {req.doctorName} chỉ định
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CalendarDaysIcon className="h-3 w-3" />{fmtDateTime(req.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={req.status} />
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
          {req.indicationReason && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Lý do chỉ định:</span> {req.indicationReason}
            </p>
          )}
          {req.basePrice != null && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Chi phí:</span> {fmtCurrency(req.basePrice)}
            </p>
          )}

          {req.status === 'COMPLETED' ? (
            <>
              {req.resultSummary && (
                <div className="bg-white border border-green-100 rounded-lg px-3 py-2.5">
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <CheckCircleIcon className="h-3.5 w-3.5" />Kết quả
                  </p>
                  <p className="text-sm text-gray-700">{req.resultSummary}</p>
                </div>
              )}
              {images.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                    <PhotoIcon className="h-3.5 w-3.5" />Hình ảnh kết quả
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {images.map((url, i) => (
                      <button key={i} onClick={() => onViewImage(url)}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition">
                        <img src={url} alt={`Kết quả ${i+1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {req.performedAt && (
                <p className="text-xs text-gray-400">
                  Thực hiện lúc: {fmtDateTime(req.performedAt)}
                </p>
              )}
              {!req.resultSummary && images.length === 0 && (
                <p className="text-sm text-gray-400 italic">Chưa có chi tiết kết quả</p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400 bg-white rounded-lg border border-gray-100 px-3 py-2.5">
              <ClockIcon className="h-4 w-4" />
              {req.status === 'PENDING' ? 'Đang chờ thực hiện xét nghiệm' :
               req.status === 'IN_PROGRESS' ? 'Đang trong quá trình thực hiện' :
               'Yêu cầu đã bị hủy'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const FILTERS = [
  { value:'', label:'Tất cả' },
  { value:'PENDING',     label:'Chờ thực hiện' },
  { value:'IN_PROGRESS', label:'Đang thực hiện' },
  { value:'COMPLETED',   label:'Đã có kết quả' },
  { value:'CANCELLED',   label:'Đã hủy' },
];

const TestResultsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('');
  const [viewImage, setViewImage] = useState(null);

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/service-requests/patient/{patientId}
        const data = await getMyServiceRequests(patientId);
        setRequests(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.response?.status === 404) setRequests([]);
        else setError(e.response?.data?.message || 'Không thể tải kết quả xét nghiệm.');
      } finally { setLoading(false); }
    };
    if (patientId) load();
  }, [patientId]);

  const filtered = useMemo(() => {
    return requests.filter(r => {
      const matchFilter = !filter || r.status === filter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        r.serviceName?.toLowerCase().includes(q) ||
        r.doctorName?.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [requests, filter, search]);

  const stats = useMemo(() => ({
    total:     requests.length,
    pending:   requests.filter(r => ['PENDING','IN_PROGRESS'].includes(r.status)).length,
    completed: requests.filter(r => r.status === 'COMPLETED').length,
  }), [requests]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kết quả xét nghiệm</h1>
          <p className="text-sm text-gray-500 mt-0.5">Theo dõi các chỉ định cận lâm sàng và kết quả</p>
        </div>

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label:'Tổng', value: stats.total, color:'text-gray-800', bg:'bg-gray-50' },
              { label:'Chờ kết quả', value: stats.pending, color:'text-yellow-700', bg:'bg-yellow-50' },
              { label:'Đã có kết quả', value: stats.completed, color:'text-green-700', bg:'bg-green-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-gray-100`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo dịch vụ, bác sĩ..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={filter} onChange={e => setFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
              {FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <BeakerIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">
              {requests.length === 0 ? 'Chưa có chỉ định xét nghiệm nào' : 'Không tìm thấy kết quả'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.requestId} req={req} onViewImage={setViewImage} />
          ))}
        </div>
      </div>

      {viewImage && <ImageModal src={viewImage} onClose={() => setViewImage(null)} />}
    </PatientLayout>
  );
};

export default TestResultsPage;
