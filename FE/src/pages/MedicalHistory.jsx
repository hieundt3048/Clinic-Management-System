import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getPatientMedicalRecords, getStoredUser } from '../services/api';
import {
  ArrowPathIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const arr = (value) => (Array.isArray(value) ? value : []);
const fmtDate = (value) => {
  if (!value) return '—';
  const source = String(value);
  const date = new Date(source.includes('T') ? source : `${source}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};
const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const Empty = ({ children }) => (
  <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-blue-200 bg-blue-50/70 py-16 text-blue-500">
    <ClipboardDocumentListIcon className="h-14 w-14 text-gray-200" />
    <p className="text-base font-medium text-gray-500">{children}</p>
  </div>
);

const RecordCard = ({ record }) => (
  <article className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-bold text-blue-700">Bệnh án #{record.recordId}</p>
        <h3 className="mt-1 text-lg font-bold text-gray-900">{record.patientName || 'Bệnh nhân'}</h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1"><UserIcon className="h-3.5 w-3.5" />BS. {record.doctorName || '—'}</span>
          <span className="inline-flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDateTime(record.createdAt)}</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {record.recommendedFollowUpDate && (
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            Tái khám: {fmtDate(record.recommendedFollowUpDate)}
          </span>
        )}
        {record.hasPrescription && (
          <span className="rounded-full border border-green-100 bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
            Có đơn thuốc
          </span>
        )}
      </div>
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Chẩn đoán</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{record.diagnosis || '—'}</p>
      </div>
      <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hướng điều trị</p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-gray-800">{record.treatmentPlan || '—'}</p>
      </div>
    </div>

    <div className="mt-4 rounded-xl border border-sky-200 bg-sky-100/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Liên kết hồ sơ</p>
      <div className="mt-2 grid gap-2 text-sm text-blue-900 sm:grid-cols-2">
        <p>Mã lịch hẹn: <span className="font-bold">#{record.appointmentId || '—'}</span></p>
        <p>Mã bệnh nhân: <span className="font-bold">#{record.patientId || '—'}</span></p>
      </div>
    </div>
  </article>
);

const MedicalHistory = () => {
  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;
  const [records, setRecords] = useState([]);
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
      const data = await getPatientMedicalRecords(patientId);
      setRecords(arr(data).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
    } catch (err) {
      if (err.response?.status === 404) setRecords([]);
      else setError(err.response?.data?.message || 'Không thể tải lịch sử bệnh án.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((record) =>
      record.doctorName?.toLowerCase().includes(q) ||
      record.diagnosis?.toLowerCase().includes(q) ||
      record.treatmentPlan?.toLowerCase().includes(q)
    );
  }, [records, search]);

  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lịch sử bệnh án</h1>
            <p className="mt-0.5 text-sm text-gray-500">Xem đầy đủ chẩn đoán, hướng điều trị và lịch tái khám từ bác sĩ.</p>
          </div>
          <button type="button" onClick={load} className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <ArrowPathIcon className="h-4 w-4" />Tải lại
          </button>
        </div>

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-sky-200 bg-sky-100/70 px-4 py-3">
              <p className="text-2xl font-bold text-blue-700">{records.length}</p>
              <p className="text-xs font-semibold text-blue-600">Bệnh án</p>
            </div>
            <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3">
              <p className="text-2xl font-bold text-green-700">{records.filter((r) => r.hasPrescription).length}</p>
              <p className="text-xs font-semibold text-green-600">Có đơn thuốc</p>
            </div>
            <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
              <p className="text-2xl font-bold text-cyan-700">{records.filter((r) => r.recommendedFollowUpDate).length}</p>
              <p className="text-xs font-semibold text-cyan-600">Có lịch tái khám</p>
            </div>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo bác sĩ, chẩn đoán, hướng điều trị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <Empty>{records.length === 0 ? 'Chưa có bệnh án nào' : 'Không tìm thấy bệnh án phù hợp'}</Empty>}

        <div className="space-y-4">
          {filtered.map((record) => <RecordCard key={record.recordId} record={record} />)}
        </div>
      </div>
    </PatientLayout>
  );
};

export default MedicalHistory;