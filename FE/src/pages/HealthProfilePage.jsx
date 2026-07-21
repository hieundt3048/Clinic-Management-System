import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  getHealthMetricSummary,
  getMyHealthMetrics,
  getStoredUser,
} from '../services/api';
import {
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  HeartIcon,
  InformationCircleIcon,
  ScaleIcon,
  SparklesIcon,
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

const metricFields = [
  ['systolicBp', 'Huyết áp tâm thu', 'mmHg'],
  ['diastolicBp', 'Huyết áp tâm trương', 'mmHg'],
  ['heartRate', 'Nhịp tim', 'bpm'],
  ['weight', 'Cân nặng', 'kg'],
  ['height', 'Chiều cao', 'cm'],
  ['temperature', 'Nhiệt độ', '°C'],
  ['bloodGlucose', 'Đường huyết', 'mmol/L'],
  ['spO2', 'SpO2', '%'],
];

const arr = (value) => (Array.isArray(value) ? value : []);
const sortDesc = (items, field) => arr(items).slice().sort((a, b) => new Date(b[field] || 0) - new Date(a[field] || 0));

const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const fmtDateLabel = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const latestSummaryTime = (summary, latestRecord) => {
  const times = [
    summary?.bpMeasuredAt,
    summary?.heartRateMeasuredAt,
    summary?.weightMeasuredAt,
    summary?.temperatureMeasuredAt,
    summary?.bloodGlucoseMeasuredAt,
    summary?.spO2MeasuredAt,
    latestRecord?.measuredAt,
  ].filter(Boolean).map((value) => new Date(value)).filter((date) => !Number.isNaN(date.getTime()));
  if (times.length === 0) return null;
  return new Date(Math.max(...times.map((date) => date.getTime()))).toISOString();
};

const Empty = ({ children }) => (
  <div className="rounded-xl border border-dashed border-sky-200 bg-sky-50/80 px-4 py-8 text-center text-sm text-sky-700">
    {children}
  </div>
);

const Stat = ({ icon: Icon, label, value, tone = 'blue' }) => {
  const tones = {
    blue: 'border-blue-100 bg-blue-50 text-blue-700',
    green: 'border-green-100 bg-green-50 text-green-700',
    cyan: 'border-cyan-100 bg-cyan-50 text-cyan-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone] || tones.blue}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
};

const SummaryCard = ({ label, value, unit, measuredAt, tone }) => (
  <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-2 flex items-end gap-1">
      <span className={'text-2xl font-bold ' + tone}>{value ?? '—'}</span>
      {value !== null && value !== undefined && unit && <span className="pb-1 text-xs font-semibold text-gray-500">{unit}</span>}
    </div>
    <p className="mt-2 text-xs text-gray-400">{fmtDateTime(measuredAt)}</p>
  </div>
);

const Metric = ({ label, value, unit }) => (
  <div className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-2 text-xl font-bold text-gray-900">
      {value ?? '—'}
      {value !== null && value !== undefined && unit && <span className="ml-1 text-xs font-semibold text-gray-400">{unit}</span>}
    </p>
  </div>
);

const MetricCard = ({ metric }) => (
  <article className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-bold text-gray-900">{fmtDateTime(metric.measuredAt)}</p>
        <p className="mt-0.5 text-xs text-gray-500">Lần ghi nhận chỉ số sức khỏe</p>
      </div>
      {metric.bmiCategory && (
        <span className="w-fit rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
          BMI {metric.bmi ?? '—'} · {metric.bmiCategory}
        </span>
      )}
    </div>
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {metric.systolicBp && metric.diastolicBp && <Metric label="Huyết áp" value={`${metric.systolicBp}/${metric.diastolicBp}`} unit="mmHg" />}
      <Metric label="Nhịp tim" value={metric.heartRate} unit="bpm" />
      <Metric label="Cân nặng" value={metric.weight} unit="kg" />
      <Metric label="SpO2" value={metric.spO2} unit="%" />
    </div>
    {metric.notes && <p className="mt-4 rounded-lg border border-sky-100 bg-sky-50 px-3 py-2 text-sm text-gray-600">{metric.notes}</p>}
  </article>
);

const HealthProfilePage = () => {
  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;
  const metricsSectionRef = useRef(null);
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPage = useCallback(async () => {
    if (!patientId) {
      setLoading(false);
      setError('Không tìm thấy mã bệnh nhân trong phiên đăng nhập.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const [metricRes, summaryRes] = await Promise.allSettled([
        getMyHealthMetrics(patientId),
        getHealthMetricSummary(patientId),
      ]);
      if (metricRes.status === 'rejected' && metricRes.reason?.response?.status !== 404) {
        throw metricRes.reason;
      }
      setMetrics(sortDesc(metricRes.status === 'fulfilled' ? metricRes.value : [], 'measuredAt'));
      setSummary(summaryRes.status === 'fulfilled' ? summaryRes.value : null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hồ sơ sức khỏe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => { loadPage(); }, [loadPage]);

  const latestRecord = metrics[0] || null;
  const latestBp = summary?.systolicBp && summary?.diastolicBp
    ? `${summary.systolicBp}/${summary.diastolicBp}`
    : latestRecord?.systolicBp && latestRecord?.diastolicBp
      ? `${latestRecord.systolicBp}/${latestRecord.diastolicBp}`
      : '—';
  const updatedAt = latestSummaryTime(summary, latestRecord);

  const chartData = useMemo(() => metrics
    .slice()
    .reverse()
    .slice(-12)
    .map((item) => ({
      date: fmtDateLabel(item.measuredAt),
      systolicBp: item.systolicBp,
      diastolicBp: item.diastolicBp,
      heartRate: item.heartRate,
      weight: item.weight,
      temperature: item.temperature,
      spO2: item.spO2,
      bloodGlucose: item.bloodGlucose,
    })), [metrics]);

  const scrollToMetrics = () => {
    metricsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <PatientLayout>
      <div className="mx-auto max-w-6xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ sức khỏe</h1>
            <p className="mt-0.5 text-sm text-gray-500">Theo dõi các chỉ số sức khỏe do bác sĩ ghi nhận. Bệnh án, đơn thuốc và kết quả xét nghiệm nằm ở các mục riêng trong menu.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadPage} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              <ArrowPathIcon className="h-4 w-4" />Tải lại
            </button>
            <button type="button" onClick={scrollToMetrics} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              <ChartBarIcon className="h-4 w-4" />Xem chỉ số
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm">Đang tải hồ sơ sức khỏe...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            <ExclamationCircleIcon className="h-5 w-5" />{error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-100">Tổng quan sức khỏe</p>
                  <h2 className="mt-2 text-2xl font-bold">Chỉ số mới nhất của bạn</h2>
                  <p className="mt-1 text-sm text-blue-50">Dữ liệu này được bác sĩ ghi nhận trong quá trình khám và theo dõi điều trị.</p>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-50">Lần cập nhật gần nhất</p>
                  <p className="mt-1 text-lg font-bold">{fmtDateTime(updatedAt)}</p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={HeartIcon} label="Nhịp tim" value={summary?.heartRate ? `${summary.heartRate} bpm` : latestRecord?.heartRate ? `${latestRecord.heartRate} bpm` : '—'} tone="blue" />
              <Stat icon={ChartBarIcon} label="Huyết áp" value={latestBp} tone="cyan" />
              <Stat icon={ScaleIcon} label="BMI" value={summary?.bmi ?? latestRecord?.bmi ?? '—'} tone="green" />
              <Stat icon={SparklesIcon} label="Số lần đo" value={metrics.length} tone="blue" />
            </div>

            <section ref={metricsSectionRef} className="scroll-mt-6 rounded-xl border border-sky-200 bg-sky-50/90 shadow-md shadow-sky-100">
              <div className="border-b border-sky-200 bg-sky-100/60 px-5 py-4">
                <h3 className="text-base font-bold text-gray-900">Chi tiết chỉ số mới nhất</h3>
                <p className="mt-0.5 text-sm text-gray-500">Các chỉ số sức khỏe được ghi nhận gần đây nhất, hiển thị ngay trong hồ sơ này.</p>
              </div>
              <div className="p-5">
                {latestRecord ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      {metricFields.map(([key, label, unit]) => (
                        <Metric key={key} label={label} value={latestRecord[key]} unit={unit} />
                      ))}
                      <Metric label="BMI" value={latestRecord.bmi ?? summary?.bmi} />
                      <Metric label="Đánh giá BMI" value={latestRecord.bmiCategory ?? summary?.bmiCategory} />
                    </div>
                    {latestRecord.notes && <p className="rounded-lg border border-sky-100 bg-white px-3 py-2 text-sm text-gray-600">{latestRecord.notes}</p>}
                  </div>
                ) : <Empty>Chưa có chỉ số sức khỏe nào được bác sĩ ghi nhận.</Empty>}
              </div>
            </section>

            <section className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
              <div className="mb-4 flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Xu hướng gần đây</h3>
              </div>

              {chartData.length === 0 ? (
                <Empty>Chưa có đủ dữ liệu để vẽ biểu đồ xu hướng.</Empty>
              ) : (
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

            <section className="rounded-xl border border-sky-200 bg-sky-50/90 shadow-md shadow-sky-100">
              <div className="flex items-center gap-2 border-b border-sky-200 bg-sky-100/60 px-5 py-4">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">Lịch sử đo chỉ số</h3>
                  <p className="mt-0.5 text-sm text-gray-500">Toàn bộ các lần ghi nhận sức khỏe gần đây</p>
                </div>
              </div>
              <div className="space-y-3 p-5">
                {metrics.length === 0 ? <Empty>Chưa có lịch sử đo chỉ số sức khỏe.</Empty> : metrics.map((metric) => (
                  <MetricCard key={metric.metricId || metric.measuredAt} metric={metric} />
                ))}
              </div>
            </section>

            <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-800 shadow-sm">
              <InformationCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
              <p>Bệnh nhân chỉ xem lịch sử chỉ số. Khi cần cập nhật, bác sĩ sẽ ghi nhận chỉ số mới từ khu vực bác sĩ và dữ liệu sẽ tự hiển thị lại trong hồ sơ này.</p>
            </div>
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default HealthProfilePage;