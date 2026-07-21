import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyPrescriptions, getStoredUser } from '../services/api';
import {
  ArrowPathIcon,
  BeakerIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const arr = (value) => (Array.isArray(value) ? value : []);
const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const Empty = ({ children }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 py-16 text-blue-500">
    <DocumentTextIcon className="h-14 w-14 text-gray-200" />
    <p className="text-base font-medium text-gray-500">{children}</p>
  </div>
);

const PrescriptionCard = ({ rx }) => (
  <article className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-bold text-blue-700">Đơn thuốc #{rx.prescriptionId}</p>
        <h3 className="mt-1 text-lg font-bold text-gray-900">{rx.patientName || 'Bệnh nhân'}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" />BS. {rx.doctorName || '—'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDateTime(rx.createdAt)}</span>
        </div>
      </div>
      <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
        {arr(rx.details).length} thuốc
      </span>
    </div>

    {rx.notes && (
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Ghi chú của bác sĩ</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-amber-900">{rx.notes}</p>
      </div>
    )}

    <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
      <div className="grid grid-cols-[1.2fr_1fr_1fr_0.6fr] bg-blue-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-blue-700">
        <span>Thuốc</span>
        <span>Liều dùng</span>
        <span>Tần suất</span>
        <span>Ngày</span>
      </div>
      {arr(rx.details).length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">Không có thông tin thuốc</div>
      ) : arr(rx.details).map((detail, index) => (
        <div key={detail.detailId || index} className="grid grid-cols-[1.2fr_1fr_1fr_0.6fr] gap-3 border-t border-blue-100 px-4 py-3 text-sm text-gray-700">
          <div className="font-semibold text-gray-900">
            <span className="inline-flex items-center gap-2"><BeakerIcon className="h-4 w-4 text-blue-500" />{detail.medicineName || '—'}</span>
          </div>
          <div>{detail.dosage || '—'}</div>
          <div>{detail.frequency || '—'}</div>
          <div>{detail.durationDays || 0}</div>
        </div>
      ))}
    </div>

    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-100/70 p-4 text-sm text-blue-900">
      Mã bệnh án liên quan: <span className="font-bold">#{rx.recordId || '—'}</span>
    </div>
  </article>
);

const PrescriptionsPage = () => {
  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      setError('Không tìm thấy mã bệnh nhân trong phiên đăng nhập.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getMyPrescriptions(patientId);
      setPrescriptions(arr(data).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      if (err.response?.status === 404) setPrescriptions([]);
      else setError(err.response?.data?.message || 'Không thể tải đơn thuốc.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return prescriptions;
    return prescriptions.filter((rx) =>
      rx.doctorName?.toLowerCase().includes(q) ||
      rx.notes?.toLowerCase().includes(q) ||
      arr(rx.details).some((detail) => detail.medicineName?.toLowerCase().includes(q))
    );
  }, [prescriptions, search]);

  const medicineCount = prescriptions.reduce((sum, rx) => sum + arr(rx.details).length, 0);

  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Đơn thuốc</h1>
            <p className="mt-0.5 text-sm text-gray-500">Xem đầy đủ thuốc, liều dùng, tần suất và ghi chú của bác sĩ.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className="h-4 w-4" />Tải lại
          </button>
        </div>

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-3">
              <p className="text-2xl font-bold text-blue-700">{prescriptions.length}</p>
              <p className="text-xs font-semibold text-blue-600">Đơn thuốc</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-2xl font-bold text-green-700">{medicineCount}</p>
              <p className="text-xs font-semibold text-green-600">Loại thuốc</p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
              <p className="text-2xl font-bold text-cyan-700">{prescriptions.filter((rx) => rx.notes).length}</p>
              <p className="text-xs font-semibold text-cyan-600">Có ghi chú</p>
            </div>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo bác sĩ, tên thuốc, ghi chú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <Empty>{prescriptions.length === 0 ? 'Bạn chưa có đơn thuốc nào' : 'Không tìm thấy đơn thuốc phù hợp'}</Empty>}

        <div className="space-y-4">
          {filtered.map((rx) => <PrescriptionCard key={rx.prescriptionId} rx={rx} />)}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PrescriptionsPage;