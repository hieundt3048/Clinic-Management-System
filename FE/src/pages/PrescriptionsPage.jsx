import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyPrescriptions, getStoredUser } from '../services/api';
import {
  DocumentTextIcon, MagnifyingGlassIcon, ArrowPathIcon,
  ExclamationCircleIcon, ChevronDownIcon, BeakerIcon,
  CalendarDaysIcon, UserIcon,
} from '@heroicons/react/24/outline';

const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '—';

const PrescriptionCard = ({ rx }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full p-4 flex items-start justify-between gap-3 text-left">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-100 shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Đơn #{rx.prescriptionId}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5 text-gray-400" />BS. {rx.doctorName}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CalendarDaysIcon className="h-3 w-3" />{fmtDateTime(rx.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
            {rx.details?.length || 0} thuốc
          </span>
          <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2.5">
          {rx.notes && (
            <p className="text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2">
              📝 {rx.notes}
            </p>
          )}
          {rx.details?.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm bg-white rounded-lg border border-gray-100 px-3 py-2.5">
              <BeakerIcon className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-800">{d.medicineName}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {d.dosage} · {d.frequency} · {d.durationDays} ngày
                </p>
              </div>
            </div>
          ))}
          {(!rx.details || rx.details.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-2">Không có thông tin thuốc</p>
          )}
        </div>
      )}
    </div>
  );
};

const PrescriptionsPage = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/prescriptions/patient/{patientId}
        const data = await getMyPrescriptions(patientId);
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.response?.status === 404) setPrescriptions([]);
        else setError(e.response?.data?.message || 'Không thể tải đơn thuốc.');
      } finally { setLoading(false); }
    };
    if (patientId) load();
  }, [patientId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return prescriptions.filter(rx =>
      !q ||
      rx.doctorName?.toLowerCase().includes(q) ||
      rx.details?.some(d => d.medicineName?.toLowerCase().includes(q))
    );
  }, [prescriptions, search]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn thuốc</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem lại các đơn thuốc đã được kê</p>
        </div>

        {!loading && !error && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3 inline-flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-700">{prescriptions.length}</span>
            <span className="text-sm text-blue-600">đơn thuốc</span>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Tìm theo bác sĩ, tên thuốc..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <DocumentTextIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">
              {prescriptions.length === 0 ? 'Bạn chưa có đơn thuốc nào' : 'Không tìm thấy kết quả'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(rx => <PrescriptionCard key={rx.prescriptionId} rx={rx} />)}
        </div>
      </div>
    </PatientLayout>
  );
};

export default PrescriptionsPage;
