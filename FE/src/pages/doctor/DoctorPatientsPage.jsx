import React, { useEffect, useMemo, useState } from 'react';
import DoctorLayout from './DoctorLayout';
import {
  getDoctorAppointments,
  getPatientHealthMetrics,
  getStoredUser,
  recordHealthMetric,
} from '../../services/api';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  PlusCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const emptyMetricForm = {
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

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN');
};

const MetricBadge = ({ label, value, unit, normal }) => {
  if (value == null) return null;
  return (
    <div className={`flex flex-col items-center rounded-xl border px-3 py-2 text-center ${
      normal === false ? 'border-red-200 bg-red-50' : 'border-sky-200 bg-white'
    }`}>
      <p className={`text-base font-bold ${normal === false ? 'text-red-600' : 'text-gray-800'}`}>
        {value}<span className="ml-0.5 text-xs font-normal">{unit}</span>
      </p>
      <p className="mt-0.5 text-xs text-gray-400">{label}</p>
    </div>
  );
};

const MetricInput = ({ field, value, onChange }) => (
  <label className="block">
    <span className="mb-1 block text-xs font-semibold text-gray-600">{field.label}</span>
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
      <span className="flex items-center rounded-r-lg border-l border-gray-100 bg-gray-50 px-2 text-xs font-semibold text-gray-500">
        {field.unit}
      </span>
    </div>
  </label>
);

const PatientCard = ({ patient }) => {
  const [expanded, setExpanded] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyMetricForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const loadMetrics = async (force = false) => {
    if (!force && metrics !== null) {
      setExpanded((value) => !value);
      return;
    }
    setExpanded(true);
    setLoadingMetrics(true);
    try {
      const data = await getPatientHealthMetrics(patient.patientId);
      const sorted = (Array.isArray(data) ? data : [])
        .slice()
        .sort((a, b) => new Date(b.measuredAt || 0) - new Date(a.measuredAt || 0));
      setMetrics(sorted);
    } catch {
      setMetrics([]);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPayload(form, patient.patientId);
    if (!hasMetricValue(payload)) {
      setFormError('Nhập ít nhất một chỉ số sức khỏe.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await recordHealthMetric(payload);
      setForm(emptyMetricForm);
      setToast('Đã ghi nhận chỉ số mới cho bệnh nhân.');
      setTimeout(() => setToast(''), 3000);
      await loadMetrics(true);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Không thể lưu chỉ số. Vui lòng kiểm tra lại dữ liệu.');
    } finally {
      setSaving(false);
    }
  };

  const latest = metrics?.[0];

  return (
    <div className="overflow-hidden rounded-xl border border-sky-200 bg-sky-50/90 shadow-md shadow-sky-100 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <UserIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{patient.name}</p>
            <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
              {patient.phone && <span>{patient.phone}</span>}
              <span>{patient.appointmentCount} lần khám</span>
              <span>Lần cuối: {fmtDate(patient.lastVisit)}</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => loadMetrics(false)}
          className="flex shrink-0 items-center gap-1 rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
        >
          <HeartIcon className="h-3.5 w-3.5" />
          {expanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
          Chỉ số
        </button>
      </div>

      {expanded && (
        <div className="border-t border-sky-200 bg-sky-100/50 px-4 py-4">
          {loadingMetrics && (
            <div className="flex justify-center py-4">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}

          {!loadingMetrics && toast && (
            <div className="mb-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-semibold text-green-700">
              {toast}
            </div>
          )}

          {!loadingMetrics && (!metrics || metrics.length === 0) && (
            <p className="rounded-lg border border-dashed border-sky-200 bg-white/70 py-4 text-center text-sm text-gray-500">Chưa có chỉ số sức khỏe nào</p>
          )}

          {!loadingMetrics && latest && (
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-500">Chỉ số mới nhất - {fmtDateTime(latest.measuredAt)}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <MetricBadge label="Tâm thu" value={latest.systolicBp} unit="mmHg" normal={latest.systolicBp ? latest.systolicBp <= 140 : null} />
                <MetricBadge label="Tâm trương" value={latest.diastolicBp} unit="mmHg" normal={latest.diastolicBp ? latest.diastolicBp <= 90 : null} />
                <MetricBadge label="Nhịp tim" value={latest.heartRate} unit="bpm" normal={latest.heartRate ? (latest.heartRate >= 60 && latest.heartRate <= 100) : null} />
                <MetricBadge label="SpO2" value={latest.spO2} unit="%" normal={latest.spO2 ? latest.spO2 >= 95 : null} />
                <MetricBadge label="Nhiệt độ" value={latest.temperature} unit="°C" normal={latest.temperature ? (latest.temperature >= 36 && latest.temperature <= 37.5) : null} />
                <MetricBadge label="Cân nặng" value={latest.weight} unit="kg" />
                <MetricBadge label="Đường huyết" value={latest.bloodGlucose} unit="mmol/L" normal={latest.bloodGlucose ? latest.bloodGlucose <= 7.8 : null} />
                {latest.bmi && <MetricBadge label="BMI" value={latest.bmi?.toFixed ? latest.bmi.toFixed(1) : latest.bmi} unit="" normal={latest.bmi ? (latest.bmi >= 18.5 && latest.bmi <= 25) : null} />}
              </div>
              {latest.notes && (
                <p className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-xs text-gray-600">
                  {latest.notes}
                </p>
              )}
            </div>
          )}

          <div className="mt-4">
            {!showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <PlusCircleIcon className="h-4 w-4" />
                Ghi chỉ số mới
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-xl border border-sky-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Ghi chỉ số sức khỏe</h3>
                    <p className="text-xs text-gray-500">Dữ liệu sau khi lưu sẽ hiển thị ở trang bệnh nhân.</p>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)} className="text-xs font-semibold text-gray-500 hover:text-gray-700">Đóng</button>
                </div>

                <label className="mb-3 block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">Thời điểm đo</span>
                  <input
                    type="datetime-local"
                    value={form.measuredAt}
                    onChange={(event) => updateForm('measuredAt', event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {metricFields.map((field) => (
                    <MetricInput key={field.key} field={field} value={form[field.key]} onChange={updateForm} />
                  ))}
                </div>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-semibold text-gray-600">Ghi chú</span>
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(event) => updateForm('notes', event.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Triệu chứng, tình trạng lúc đo, dặn dò ngắn..."
                  />
                </label>

                {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}

                <button
                  type="submit"
                  disabled={saving}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                  {saving ? 'Đang lưu...' : 'Lưu chỉ số'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const user = getStoredUser();
  const doctorId = user?.doctorId ?? user?.userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const appointments = await getDoctorAppointments(doctorId);
        const map = {};
        (Array.isArray(appointments) ? appointments : []).forEach((appointment) => {
          if (!map[appointment.patientId]) {
            map[appointment.patientId] = {
              patientId: appointment.patientId,
              name: appointment.patientName,
              phone: appointment.patientPhone,
              appointmentCount: 1,
              lastVisit: appointment.appointmentDate,
            };
          } else {
            map[appointment.patientId].appointmentCount += 1;
            if (new Date(appointment.appointmentDate) > new Date(map[appointment.patientId].lastVisit)) {
              map[appointment.patientId].lastVisit = appointment.appointmentDate;
            }
          }
        });
        setPatients(Object.values(map).sort((a, b) => new Date(b.lastVisit || 0) - new Date(a.lastVisit || 0)));
      } catch {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) load();
  }, [doctorId]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return patients.filter((patient) => !query || patient.name?.toLowerCase().includes(query) || patient.phone?.includes(query));
  }, [patients, search]);

  return (
    <DoctorLayout>
      <div className="mx-auto max-w-5xl space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bệnh nhân của tôi</h2>
          <p className="mt-0.5 text-sm text-gray-500">Xem bệnh nhân đã khám và ghi nhận chỉ số sức khỏe khi cần theo dõi.</p>
        </div>

        {!loading && (
          <div className="inline-flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <span className="text-2xl font-bold text-blue-700">{patients.length}</span>
            <span className="text-sm text-blue-600">bệnh nhân đã khám</span>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm bệnh nhân theo tên hoặc số điện thoại..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-sky-200 bg-sky-50/80 py-16 text-sky-500">
            <UserIcon className="h-14 w-14 text-sky-300" />
            <p className="text-base font-medium text-gray-600">
              {patients.length === 0 ? 'Chưa có bệnh nhân nào' : 'Không tìm thấy bệnh nhân'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((patient) => <PatientCard key={patient.patientId} patient={patient} />)}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientsPage;
