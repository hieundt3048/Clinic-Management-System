import React, { useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  deleteHealthMetric,
  getHealthMetricSummary,
  getMyHealthMetrics,
  getStoredUser,
  recordHealthMetric,
} from '../services/api';
import {
  ArrowPathIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  PlusCircleIcon,
  TrashIcon,
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

const emptyForm = {
  measuredAt: '',
  systolicBp: '',
  diastolicBp: '',
  heartRate: '',
  weight: '',
  height: '',
  temperature: '',
  bloodGlucose: '',
  spO2: '',
  notes: '',
};

const metricFields = [
  { key: 'systolicBp', label: 'Huyết áp tâm thu', unit: 'mmHg', min: 60, max: 250, step: 1 },
  { key: 'diastolicBp', label: 'Huyết áp tâm trương', unit: 'mmHg', min: 40, max: 150, step: 1 },
  { key: 'heartRate', label: 'Nhịp tim', unit: 'bpm', min: 30, max: 250, step: 1 },
  { key: 'weight', label: 'Cân nặng', unit: 'kg', min: 1, max: 500, step: 0.1 },
  { key: 'height', label: 'Chiều cao', unit: 'cm', min: 30, max: 300, step: 0.1 },
  { key: 'temperature', label: 'Nhiệt độ', unit: '°C', min: 34, max: 43, step: 0.1 },
  { key: 'bloodGlucose', label: 'Đường huyết', unit: 'mmol/L', min: 1, max: 50, step: 0.1 },
  { key: 'spO2', label: 'SpO2', unit: '%', min: 50, max: 100, step: 1 },
];

const numberOrNull = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

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

const buildPayload = (form, patientId) => {
  const payload = {
    patientId,
    measuredAt: form.measuredAt || null,
    notes: form.notes.trim() || null,
  };

  metricFields.forEach((field) => {
    payload[field.key] = numberOrNull(form[field.key]);
  });

  return payload;
};

const hasMetricValue = (payload) =>
  metricFields.some((field) => payload[field.key] !== null && payload[field.key] !== undefined);

const MetricInput = ({ field, value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{field.label}</span>
    <div className="flex rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
      <input
        type="number"
        min={field.min}
        max={field.max}
        step={field.step}
        value={value}
        onChange={(event) => onChange(field.key, event.target.value)}
        className="min-w-0 flex-1 rounded-l-lg border-0 px-3 py-2 text-sm outline-none"
      />
      <span className="flex items-center rounded-r-lg border-l border-gray-100 bg-gray-50 px-3 text-xs font-semibold text-gray-500">
        {field.unit}
      </span>
    </div>
  </label>
);

const SummaryCard = ({ label, value, unit, measuredAt, tone }) => (
  <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <div className="mt-2 flex items-end gap-1">
      <span className={'text-2xl font-bold ' + tone}>{value ?? '--'}</span>
      {value !== null && value !== undefined && <span className="pb-1 text-xs font-semibold text-gray-500">{unit}</span>}
    </div>
    <p className="mt-2 text-xs text-gray-400">{formatDateTime(measuredAt)}</p>
  </div>
);

const HealthTrackingPage = () => {
  const [metrics, setMetrics] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  const loadData = async () => {
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
      const sorted = (Array.isArray(history) ? history : [])
        .slice()
        .sort((a, b) => new Date(b.measuredAt) - new Date(a.measuredAt));
      setMetrics(sorted);
      setSummary(latestSummary);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu theo dõi sức khỏe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [patientId]);

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

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPayload(form, patientId);
    if (!hasMetricValue(payload)) {
      setFormError('Nhập ít nhất một chỉ số sức khỏe.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await recordHealthMetric(payload);
      setForm(emptyForm);
      setToast('Đã ghi nhận chỉ số sức khỏe.');
      setTimeout(() => setToast(''), 3000);
      await loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Không thể lưu chỉ số. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (metricId) => {
    if (!window.confirm('Xóa bản ghi chỉ số này?')) return;
    setDeleting(metricId);
    try {
      await deleteHealthMetric(metricId);
      setMetrics((prev) => prev.filter((item) => item.metricId !== metricId));
      setToast('Đã xóa bản ghi chỉ số.');
      setTimeout(() => setToast(''), 3000);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa bản ghi.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <PatientLayout>
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Theo dõi sức khỏe</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Chỉ số sức khỏe cá nhân</h1>
            <p className="mt-1 text-sm text-gray-500">Ghi nhận, xem lịch sử và theo dõi xu hướng sức khỏe của bạn.</p>
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

        {toast && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
            {toast}
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Huyet ap" value={summary?.systolicBp && summary?.diastolicBp ? summary.systolicBp + '/' + summary.diastolicBp : null} unit="mmHg" measuredAt={summary?.bpMeasuredAt} tone="text-blue-700" />
            <SummaryCard label="Nhịp tim" value={summary?.heartRate} unit="bpm" measuredAt={summary?.heartRateMeasuredAt} tone="text-rose-700" />
            <SummaryCard label="BMI" value={summary?.bmi} unit={summary?.bmiCategory || ''} measuredAt={summary?.weightMeasuredAt} tone="text-emerald-700" />
            <SummaryCard label="SpO2" value={summary?.spO2} unit="%" measuredAt={summary?.spO2MeasuredAt} tone="text-violet-700" />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PlusCircleIcon className="h-5 w-5 text-blue-600" />
              <h2 className="text-base font-bold text-gray-900">Ghi chỉ số mới</h2>
            </div>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Thời điểm đo</span>
              <input
                type="datetime-local"
                value={form.measuredAt}
                onChange={(event) => updateForm('measuredAt', event.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {metricFields.map((field) => (
                <MetricInput key={field.key} field={field} value={form[field.key]} onChange={updateForm} />
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-semibold text-gray-700">Ghi chú</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Triệu chứng, tình trạng lúc đo..."
              />
            </label>

            {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

            <button
              type="submit"
              disabled={saving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HeartIcon className="h-4 w-4" />
              {saving ? 'Đang lưu...' : 'Lưu chỉ số'}
            </button>
          </form>

          <section className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <HeartIcon className="mx-auto h-10 w-10 text-gray-300" />
                  <p className="mt-2 text-sm font-semibold text-gray-700">Chưa có chỉ số nào</p>
                  <p className="text-sm text-gray-500">Nhập chỉ số đầu tiên để bắt đầu theo dõi.</p>
                </div>
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
                      <Line type="monotone" dataKey="systolicBp" name="Tâm thu" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="diastolicBp" name="Tâm trương" stroke="#60a5fa" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="heartRate" name="Nhịp tim" stroke="#e11d48" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="weight" name="Cân nặng" stroke="#059669" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="temperature" name="Nhiệt độ" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
                      <Line type="monotone" dataKey="spO2" name="SpO2" stroke="#7c3aed" strokeWidth={2} dot={false} connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardDocumentListIcon className="h-5 w-5 text-blue-600" />
                <h2 className="text-base font-bold text-gray-900">Lịch sử ghi nhận</h2>
              </div>

              {!loading && !error && metrics.length > 0 && (
                <div className="space-y-3">
                  {metrics.map((item) => (
                    <article key={item.metricId} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{formatDateTime(item.measuredAt)}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                            {item.systolicBp && item.diastolicBp && <span className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">HA {item.systolicBp}/{item.diastolicBp}</span>}
                            {item.heartRate && <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-700">Mạch {item.heartRate}</span>}
                            {item.weight && <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">{item.weight} kg</span>}
                            {item.temperature && <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">{item.temperature} °C</span>}
                            {item.bloodGlucose && <span className="rounded-full bg-purple-50 px-2 py-1 text-purple-700">Đường huyết {item.bloodGlucose}</span>}
                            {item.spO2 && <span className="rounded-full bg-violet-50 px-2 py-1 text-violet-700">SpO2 {item.spO2}%</span>}
                            {item.bmi && <span className="rounded-full bg-gray-50 px-2 py-1 text-gray-700">BMI {item.bmi} {item.bmiCategory || ''}</span>}
                          </div>
                          {item.notes && <p className="mt-2 text-sm text-gray-500">{item.notes}</p>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.metricId)}
                          disabled={deleting === item.metricId}
                          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                          {deleting === item.metricId ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PatientLayout>
  );
};

export default HealthTrackingPage;
