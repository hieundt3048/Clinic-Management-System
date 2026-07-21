import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  getHealthMetricSummary,
  getMyHealthMetrics,
  getStoredUser,
} from '../services/api';
import {
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const arr = (value) => (Array.isArray(value) ? value : []);

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatDateLabel = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const SummaryCard = ({ label, value, unit, measuredAt, tone }) => (
  <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-2 flex items-end gap-1">
      <span className={'text-2xl font-bold ' + tone}>{value ?? '--'}</span>
      {value !== null && value !== undefined && unit && <span className="pb-1 text-xs font-semibold text-gray-500">{unit}</span>}
    </div>
    <p className="mt-2 text-xs text-gray-400">{formatDateTime(measuredAt)}</p>
  </div>
);

const EmptyState = ({ children }) => (
  <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/80 px-4 py-10 text-center text-sm text-sky-600">
    <HeartIcon className="mx-auto h-10 w-10 text-sky-300" />
    <p className="mt-3 font-semibold">{children}</p>
  </div>
);

const metricBadges = [
  { key: 'bp', color: 'bg-blue-50 text-blue-700', render: (item) => item.systolicBp && item.diastolicBp ? `HA ${item.systolicBp}/${item.diastolicBp}` : null },
  { key: 'heartRate', color: 'bg-rose-50 text-rose-700', render: (item) => item.heartRate ? `Mạch ${item.heartRate}` : null },
  { key: 'weight', color: 'bg-emerald-50 text-emerald-700', render: (item) => item.weight ? `${item.weight} kg` : null },
  { key: 'temperature', color: 'bg-amber-50 text-amber-700', render: (item) => item.temperature ? `${item.temperature} °C` : null },
  { key: 'bloodGlucose', color: 'bg-purple-50 text-purple-700', render: (item) => item.bloodGlucose ? `Đường huyết ${item.bloodGlucose}` : null },
  { key: 'spO2', color: 'bg-violet-50 text-violet-700', render: (item) => item.spO2 ? `SpO2 ${item.spO2}%` : null },
  { key: 'bmi', color: 'bg-slate-50 text-slate-700', render: (item) => item.bmi ? `BMI ${item.bmi} ${item.bmiCategory || ''}` : null },
];

const HealthTrackingPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  const loadData = useCallback(async () => {
    if (!patientId) {
      setError('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [history, latestSummary] = await Promise.all([
        getMyHealthMetrics(patientId).catch((err) => {
          if (err.response?.status === 404) return [];
          throw err;
        }),
        getHealthMetricSummary(patientId).catch((err) => {
          if (err.response?.status === 404) return null;
          throw err;
        }),
      ]);
      const sorted = arr(history).slice().sort((a, b) => new Date(b.measuredAt || 0) - new Date(a.measuredAt || 0));
      setMetrics(sorted);
      setSummary(latestSummary);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu theo dõi sức khỏe.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = useMemo(() => metrics
    .slice()
    .reverse()
    .slice(-12)
    .map((item) => ({
      date: formatDateLabel(item.measuredAt),
      systolicBp: item.systolicBp,
      diastolicBp: item.diastolicBp,
      heartRate: item.heartRate,
      weight: item.weight,
      temperature: item.temperature,
      spO2: item.spO2,
      bloodGlucose: item.bloodGlucose,
    })), [metrics]);

  return (
    <PatientLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Theo dõi sức khỏe</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Chỉ số sức khỏe cá nhân</h1>
            <p className="mt-1 text-sm text-gray-500">Xem các chỉ số do bác sĩ ghi nhận trong quá trình khám và theo dõi điều trị.</p>
          </div>
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-800 shadow-sm">
          <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <p>Bệnh nhân chỉ xem lịch sử chỉ số. Khi cần cập nhật, bác sĩ sẽ ghi nhận chỉ số mới từ khu vực bác sĩ và dữ liệu sẽ hiển thị tại đây.</p>
        </div>

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Huyết áp" value={summary?.systolicBp && summary?.diastolicBp ? summary.systolicBp + '/' + summary.diastolicBp : null} unit="mmHg" measuredAt={summary?.bpMeasuredAt} tone="text-blue-700" />
            <SummaryCard label="Nhịp tim" value={summary?.heartRate} unit="bpm" measuredAt={summary?.heartRateMeasuredAt} tone="text-rose-700" />
            <SummaryCard label="BMI" value={summary?.bmi} unit={summary?.bmiCategory || ''} measuredAt={summary?.weightMeasuredAt} tone="text-emerald-700" />
            <SummaryCard label="SpO2" value={summary?.spO2} unit="%" measuredAt={summary?.spO2MeasuredAt} tone="text-violet-700" />
          </div>
        )}

        <section className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
          <div className="mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Xu hướng gần đây</h2>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
          )}

          {!loading && !error && chartData.length === 0 && (
            <EmptyState>Chưa có chỉ số nào được bác sĩ ghi nhận.</EmptyState>
          )}

          {!loading && !error && chartData.length > 0 && (
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="weight" name="Cân nặng" stroke="#059669" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="temperature" name="Nhiệt độ" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="heartRate" name="Nhịp tim" stroke="#e11d48" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="spO2" name="SpO2" stroke="#7c3aed" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="systolicBp" name="Tâm thu" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
                  <Line type="monotone" dataKey="diastolicBp" name="Tâm trương" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
          <div className="mb-4 flex items-center gap-2">
            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-gray-900">Lịch sử ghi nhận</h2>
          </div>

          {!loading && !error && metrics.length === 0 && <EmptyState>Chưa có lịch sử ghi nhận chỉ số.</EmptyState>}

          {!loading && !error && metrics.length > 0 && (
            <div className="space-y-3">
              {metrics.map((item) => (
                <article key={item.metricId} className="rounded-lg border border-sky-200 bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold text-gray-900">{formatDateTime(item.measuredAt)}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                    {metricBadges.map((badge) => {
                      const text = badge.render(item);
                      return text ? <span key={badge.key} className={'rounded-full px-2 py-1 ' + badge.color}>{text}</span> : null;
                    })}
                  </div>
                  {item.notes && <p className="mt-3 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-gray-600">{item.notes}</p>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </PatientLayout>
  );
};

export default HealthTrackingPage;
