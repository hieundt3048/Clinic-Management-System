import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import {
  getDoctorMedicalRecords,
  getMyDoctorProfile,
  getStoredUser,
  updateMedicalRecord,
} from '../../services/api';
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (value) => {
  if (!value) return '—';
  const source = String(value);
  const date = new Date(source.includes('T') ? source : source + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};

const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const inputCls = (error) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500',
  error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
].join(' ');

const EditRecordModal = ({ record, onClose, onUpdated }) => {
  const [form, setForm] = useState({
    diagnosis: record?.diagnosis || '',
    treatmentPlan: record?.treatmentPlan || '',
    recommendedFollowUpDate: record?.recommendedFollowUpDate || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const next = {};
    if (!form.diagnosis.trim()) next.diagnosis = 'Chẩn đoán không được để trống';
    if (form.diagnosis.trim().length > 2000) next.diagnosis = 'Chẩn đoán quá dài';
    if (form.treatmentPlan.trim().length > 2000) next.treatmentPlan = 'Hướng điều trị quá dài';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const updated = await updateMedicalRecord(record.recordId, {
        diagnosis: form.diagnosis.trim(),
        treatmentPlan: form.treatmentPlan.trim() || null,
        recommendedFollowUpDate: form.recommendedFollowUpDate || null,
      });
      onUpdated(updated);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Cập nhật bệnh án thất bại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Cập nhật bệnh án #{record.recordId}</h2>
            <p className="text-sm text-gray-400">{record.patientName} · tạo lúc {fmtDateTime(record.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <XMarkIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {apiError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{apiError}</div>}

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Chẩn đoán <span className="text-red-500">*</span></span>
            <textarea rows={4} value={form.diagnosis} onChange={(event) => setForm({ ...form, diagnosis: event.target.value })} className={inputCls(errors.diagnosis)} />
            {errors.diagnosis && <span className="mt-1 block text-xs text-red-500">{errors.diagnosis}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Hướng điều trị</span>
            <textarea rows={3} value={form.treatmentPlan} onChange={(event) => setForm({ ...form, treatmentPlan: event.target.value })} className={inputCls(errors.treatmentPlan)} />
            {errors.treatmentPlan && <span className="mt-1 block text-xs text-red-500">{errors.treatmentPlan}</span>}
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-gray-700">Ngày hẹn tái khám</span>
            <input type="date" value={form.recommendedFollowUpDate || ''} onChange={(event) => setForm({ ...form, recommendedFollowUpDate: event.target.value })} className={inputCls(false)} />
          </label>
        </div>

        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={submit} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Lưu cập nhật'}
          </button>
          <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Hủy</button>
        </div>
      </div>
    </div>
  );
};
const RecordCard = ({ record, onEdit }) => (
  <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Bệnh án #{record.recordId}</p>
        <p className="mt-1 flex items-center gap-1 text-sm font-bold text-gray-900"><UserIcon className="h-4 w-4 text-gray-400" />{record.patientName}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDateTime(record.createdAt)}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {record.hasPrescription && <span className="rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Đã kê đơn</span>}
        {record.recommendedFollowUpDate && <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Tái khám {fmtDate(record.recommendedFollowUpDate)}</span>}
        <button type="button" onClick={() => onEdit(record)} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50">
          <PencilSquareIcon className="h-4 w-4" />Sửa
        </button>
      </div>
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chẩn đoán</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.diagnosis || '—'}</p>
      </div>
      <div className="rounded-lg bg-gray-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hướng điều trị</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">{record.treatmentPlan || '—'}</p>
      </div>
    </div>
  </article>
);

const DoctorMedicalRecordsPage = () => {
  const [doctorId, setDoctorId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
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
    if (stored && profile?.doctorId) localStorage.setItem('user', JSON.stringify({ ...stored, doctorId: profile.doctorId }));
    return profile?.doctorId;
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const id = await resolveDoctorId();
      if (!id) throw new Error('missing-doctor-id');
      setDoctorId(id);
      const data = await getDoctorMedicalRecords(id).catch((err) => err.response?.status === 404 ? [] : Promise.reject(err));
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách bệnh án.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      record.patientName?.toLowerCase().includes(q)
      || record.diagnosis?.toLowerCase().includes(q)
      || record.treatmentPlan?.toLowerCase().includes(q)
      || String(record.recordId || '').includes(q)
    );
  }, [records, search]);

  const stats = useMemo(() => ({
    total: records.length,
    withPrescription: records.filter((record) => record.hasPrescription).length,
    followUp: records.filter((record) => record.recommendedFollowUpDate).length,
  }), [records]);

  const handleUpdated = (updated) => {
    setRecords((current) => current.map((record) => record.recordId === updated.recordId ? updated : record));
    setEditingRecord(null);
    showToast('Cập nhật bệnh án thành công.');
  };

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bệnh án & chẩn đoán</h2>
          <p className="mt-0.5 text-sm text-gray-400">Cập nhật chẩn đoán, hướng điều trị và lịch tái khám của bệnh nhân</p>
        </div>

        {!loading && <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-100 bg-blue-50 px-4 py-3"><p className="text-2xl font-bold text-blue-700">{stats.total}</p><p className="text-xs text-gray-500">Tổng bệnh án</p></div>
          <div className="rounded-xl border border-gray-100 bg-green-50 px-4 py-3"><p className="text-2xl font-bold text-green-700">{stats.withPrescription}</p><p className="text-xs text-gray-500">Đã kê đơn</p></div>
          <div className="rounded-xl border border-gray-100 bg-blue-50 px-4 py-3"><p className="text-2xl font-bold text-blue-700">{stats.followUp}</p><p className="text-xs text-gray-500">Có tái khám</p></div>
        </div>}

        {toast.msg && <div className={(toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700') + ' flex items-center gap-2 rounded-lg border px-4 py-3 text-sm'}>{toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}{toast.msg}</div>}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm bệnh nhân, chẩn đoán, mã bệnh án..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="flex flex-col items-center gap-3 py-20 text-gray-400"><DocumentTextIcon className="h-14 w-14 text-gray-200" /><p className="text-base font-semibold text-gray-500">Chưa có bệnh án phù hợp</p></div>}

        <div className="space-y-3">
          {!loading && !error && filtered.map((record) => <RecordCard key={record.recordId} record={record} onEdit={setEditingRecord} />)}
        </div>
      </div>

      {editingRecord && <EditRecordModal record={editingRecord} onClose={() => setEditingRecord(null)} onUpdated={handleUpdated} />}
    </DoctorLayout>
  );
};

export default DoctorMedicalRecordsPage;