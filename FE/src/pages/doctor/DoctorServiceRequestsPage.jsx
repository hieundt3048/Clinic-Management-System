import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import {
  cancelServiceRequest,
  createServiceRequests,
  getDoctorMedicalRecords,
  getClinicalServices,
  getMyDoctorProfile,
  getServiceRequestsByRecord,
  getStoredUser,
} from '../../services/api';
import {
  ArrowPathIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const emptyItem = () => ({ serviceId: '', indicationReason: '' });
const fmtDateTime = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';
const fmtMoney = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const asArray = (value) => Array.isArray(value) ? value : [];

const STATUS = {
  PENDING: { label: 'Chờ thực hiện', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Đã có kết quả', cls: 'bg-green-50 text-green-700 border-green-200' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-700 border-red-200' },
};

const inputCls = (error) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500',
  error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
].join(' ');

const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] || STATUS.PENDING;
  return <span className={'rounded-full border px-2.5 py-1 text-xs font-semibold ' + cfg.cls}>{cfg.label}</span>;
};

const CreateModal = ({ records, services, doctorId, onClose, onCreated }) => {
  const [recordId, setRecordId] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const selectedRecord = records.find((item) => item.recordId === Number(recordId));

  const updateItem = (index, key, value) => {
    setItems((current) => current.map((item, i) => i === index ? { ...item, [key]: value } : item));
  };

  const addItem = () => setItems((current) => [...current, emptyItem()]);
  const removeItem = (index) => setItems((current) => current.filter((_, i) => i !== index));

  const validate = () => {
    const next = {};
    if (!recordId) next.recordId = 'Vui lòng chọn bệnh án';
    items.forEach((item, index) => {
      if (!item.serviceId) next['service_' + index] = 'Vui lòng chọn dịch vụ cận lâm sàng';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const payload = {
        recordId: Number(recordId),
        doctorId,
        services: items.map((item) => ({
          serviceId: Number(item.serviceId),
          indicationReason: item.indicationReason.trim() || null,
        })),
      };
      await createServiceRequests(payload);
      onCreated();
    } catch (err) {
      setApiError(err.response?.data?.message || 'Tạo chỉ định cận lâm sàng thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Tạo chỉ định cận lâm sàng</h2>
            <p className="text-sm text-gray-400">Chọn bệnh án và một hoặc nhiều xét nghiệm/chẩn đoán hình ảnh cần thực hiện</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100"><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {apiError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{apiError}</div>}

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">Bệnh án <span className="text-red-500">*</span></label>
            <select value={recordId} onChange={(event) => setRecordId(event.target.value)} className={inputCls(errors.recordId)}>
              <option value="">-- Chọn bệnh án --</option>
              {records.map((record) => (
                <option key={record.recordId} value={record.recordId}>
                  #{record.recordId} - {record.patientName || 'Bệnh nhân'} - {record.diagnosis || 'Chưa có chẩn đoán'}
                </option>
              ))}
            </select>
            {errors.recordId && <p className="mt-1 text-xs text-red-500">{errors.recordId}</p>}
          </div>

          {selectedRecord && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <p className="font-semibold">{selectedRecord.patientName}</p>
              <p className="mt-1">Chẩn đoán: {selectedRecord.diagnosis || '—'}</p>
              {selectedRecord.treatmentPlan && <p className="mt-1">Hướng điều trị: {selectedRecord.treatmentPlan}</p>}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Danh sách dịch vụ cận lâm sàng</p>
            <button type="button" onClick={addItem} className="inline-flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50"><PlusIcon className="h-3.5 w-3.5" />Thêm dịch vụ</button>
          </div>
          <div className="space-y-3">
            {items.map((item, index) => {
              const service = services.find((svc) => svc.serviceId === Number(item.serviceId));
              return (
                <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500"><BeakerIcon className="h-4 w-4" />Dịch vụ {index + 1}</p>
                    {items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"><TrashIcon className="h-4 w-4" /></button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Dịch vụ cận lâm sàng <span className="text-red-500">*</span></label>
                      <select value={item.serviceId} onChange={(event) => updateItem(index, 'serviceId', event.target.value)} className={inputCls(errors['service_' + index])}>
                        <option value="">-- Chọn xét nghiệm/chẩn đoán hình ảnh --</option>
                        {services.map((svc) => <option key={svc.serviceId} value={svc.serviceId}>{svc.serviceName} - {fmtMoney(svc.basePrice)}</option>)}
                      </select>
                      {errors['service_' + index] && <p className="mt-1 text-xs text-red-500">{errors['service_' + index]}</p>}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">Lý do chỉ định</label>
                      <input value={item.indicationReason} onChange={(event) => updateItem(index, 'indicationReason', event.target.value)} placeholder="VD: kiểm tra công thức máu, xác nhận chẩn đoán..." className={inputCls(false)} />
                    </div>
                  </div>
                  {service && <p className="mt-2 text-xs text-gray-400">Chi phí dự kiến: {fmtMoney(service.basePrice)}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <button type="button" onClick={submit} disabled={saving || services.length === 0} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Tạo chỉ định'}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
        </div>
      </div>
    </div>
  );
};

const RequestCard = ({ request, onCancel, cancelling }) => (
  <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <BeakerIcon className="h-5 w-5 text-blue-600" />
          <p className="truncate text-sm font-bold text-gray-900">{request.serviceName || 'Dịch vụ cận lâm sàng'}</p>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><UserIcon className="h-3.5 w-3.5" />{request.patientName || 'Bệnh nhân'} · Bệnh án #{request.recordId}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDateTime(request.createdAt)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={request.status} />
        {request.status === 'PENDING' && (
          <button type="button" onClick={() => onCancel(request.requestId)} disabled={cancelling === request.requestId} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60">
            {cancelling === request.requestId ? 'Đang hủy...' : 'Hủy'}
          </button>
        )}
      </div>
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Lý do chỉ định</p><p className="mt-1 text-sm text-gray-700">{request.indicationReason || '—'}</p></div>
      <div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chi phí</p><p className="mt-1 text-sm text-gray-700">{fmtMoney(request.basePrice)}</p></div>
    </div>
    {request.resultSummary && <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Kết quả</p><p className="mt-1 text-sm text-green-800">{request.resultSummary}</p></div>}
  </article>
);

const DoctorServiceRequestsPage = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [records, setRecords] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const resolveDoctorId = async () => {
    const user = getStoredUser();
    if (user?.doctorId) return user.doctorId;
    const profile = await getMyDoctorProfile();
    const stored = getStoredUser();
    if (stored && profile?.doctorId) {
      localStorage.setItem('user', JSON.stringify({ ...stored, doctorId: profile.doctorId }));
    }
    return profile?.doctorId;
  };
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const id = await resolveDoctorId();
      if (!id) throw new Error('missing-doctor-id');
      setDoctorId(id);

      const [recordData, serviceData] = await Promise.all([
        getDoctorMedicalRecords(id).catch((err) => err.response?.status === 404 ? [] : Promise.reject(err)),
        getClinicalServices(),
      ]);
      const safeRecords = asArray(recordData).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setRecords(safeRecords);
      setServices(asArray(serviceData));

      const requestResults = await Promise.allSettled(safeRecords.map((record) => getServiceRequestsByRecord(record.recordId)));
      const merged = requestResults.flatMap((result) => result.status === 'fulfilled' ? asArray(result.value) : []);
      setRequests(merged.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu chỉ định cận lâm sàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((item) => {
      const matchStatus = !status || item.status === status;
      const matchSearch = !q
        || item.patientName?.toLowerCase().includes(q)
        || item.serviceName?.toLowerCase().includes(q)
        || item.indicationReason?.toLowerCase().includes(q)
        || String(item.recordId || '').includes(q);
      return matchStatus && matchSearch;
    });
  }, [requests, search, status]);

  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter((item) => item.status === 'PENDING').length,
    completed: requests.filter((item) => item.status === 'COMPLETED').length,
  }), [requests]);

  const handleCancel = async (requestId) => {
    if (!window.confirm('Hủy chỉ định cận lâm sàng này?')) return;
    setCancelling(requestId);
    try {
      await cancelServiceRequest(requestId);
      showToast('Đã hủy chỉ định.');
      await load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Hủy chỉ định thất bại.', 'error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chỉ định cận lâm sàng</h2>
            <p className="mt-0.5 text-sm text-gray-400">Tạo và theo dõi các xét nghiệm, chẩn đoán hình ảnh cho bệnh nhân</p>
          </div>
          <button type="button" onClick={() => setShowModal(true)} disabled={records.length === 0 || services.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
            <PlusIcon className="h-4 w-4" />Tạo chỉ định
          </button>
        </div>

        {!loading && <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-blue-50 px-4 py-3"><p className="text-2xl font-bold text-blue-700">{stats.total}</p><p className="text-xs text-gray-500">Tổng chỉ định</p></div>
          <div className="rounded-xl border border-gray-100 bg-yellow-50 px-4 py-3"><p className="text-2xl font-bold text-yellow-700">{stats.pending}</p><p className="text-xs text-gray-500">Chờ thực hiện</p></div>
          <div className="rounded-xl border border-gray-100 bg-green-50 px-4 py-3"><p className="text-2xl font-bold text-green-700">{stats.completed}</p><p className="text-xs text-gray-500">Đã có kết quả</p></div>
        </div>}

        {toast.msg && <div className={(toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700') + ' flex items-center gap-2 rounded-lg border px-4 py-3 text-sm'}>{toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}{toast.msg}</div>}

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bệnh nhân, dịch vụ cận lâm sàng, bệnh án..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thực hiện</option>
            <option value="IN_PROGRESS">Đang thực hiện</option>
            <option value="COMPLETED">Đã có kết quả</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && records.length === 0 && <div className="flex flex-col items-center gap-3 py-20 text-gray-400"><ClipboardDocumentListIcon className="h-14 w-14 text-gray-200" /><p className="text-base font-semibold text-gray-500">Chưa có bệnh án để tạo chỉ định</p><p className="text-sm">Hãy tạo bệnh án sau khi hoàn thành lịch khám trước.</p></div>}
        {!loading && !error && records.length > 0 && filtered.length === 0 && <div className="flex flex-col items-center gap-3 py-20 text-gray-400"><BeakerIcon className="h-14 w-14 text-gray-200" /><p className="text-base font-semibold text-gray-500">Chưa có chỉ định phù hợp</p></div>}

        <div className="space-y-3">
          {!loading && !error && filtered.map((item) => <RequestCard key={item.requestId} request={item} onCancel={handleCancel} cancelling={cancelling} />)}
        </div>
      </div>

      {showModal && <CreateModal records={records} services={services} doctorId={doctorId} onClose={() => setShowModal(false)} onCreated={() => { setShowModal(false); showToast('Tạo chỉ định cận lâm sàng thành công.'); load(); }} />}
    </DoctorLayout>
  );
};

export default DoctorServiceRequestsPage;