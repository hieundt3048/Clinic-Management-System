import React, { useEffect, useMemo, useState } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  getHealthMetricSummary,
  getMyHealthMetrics,
  getMyHealthProfile,
  getMyPrescriptions,
  getMyServiceRequests,
  getPatientMedicalRecords,
  updateMyHealthProfile,
} from '../services/api';
import {
  ArrowPathIcon,
  BeakerIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  HeartIcon,
  IdentificationIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  UserCircleIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const blankData = { records: [], prescriptions: [], requests: [], metrics: [], summary: null };
const genderLabels = { Nam: 'Nam', Nu: 'Nữ', Khac: 'Khác' };
const statusLabels = {
  PENDING: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Đã có kết quả',
  CANCELLED: 'Đã hủy',
};
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
const is404 = (error) => error?.response?.status === 404;
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
const fmtMoney = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const calcAge = (value) => {
  if (!value) return null;
  const date = new Date(String(value).includes('T') ? value : String(value) + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? null : Math.floor((Date.now() - date.getTime()) / 31557600000);
};

const inputCls = (error) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500',
  error ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300',
].join(' ');

const Panel = ({ icon: Icon, title, subtitle, count, children }) => (
  <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
    <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="h-fit rounded-lg bg-blue-50 p-2"><Icon className="h-5 w-5 text-blue-600" /></div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
      {count !== undefined && <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{count}</span>}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

const Empty = ({ children }) => (
  <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">{children}</div>
);
const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
    {children}
    {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
  </label>
);
const Info = ({ icon: Icon, label, value }) => (
  <div className="flex gap-3 border-b border-gray-100 py-3 last:border-0">
    <div className="mt-0.5 rounded-lg bg-blue-50 p-1.5"><Icon className="h-4 w-4 text-blue-600" /></div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-0.5 break-words text-sm font-semibold text-gray-800">{value || '—'}</p>
    </div>
  </div>
);
const Stat = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="rounded-lg bg-blue-50 p-2"><Icon className="h-5 w-5 text-blue-600" /></div>
    </div>
    <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
  </div>
);
const Metric = ({ label, value, unit }) => (
  <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
    <p className="mt-1 text-lg font-bold text-gray-900">{value ?? '—'}{value !== null && value !== undefined && unit && <span className="ml-1 text-xs text-gray-400">{unit}</span>}</p>
  </div>
);
const HealthProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [healthData, setHealthData] = useState(blankData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [form, setForm] = useState({ fullName: '', dateOfBirth: '', gender: '', phone: '', address: '' });
  const [formErrors, setFormErrors] = useState({});

  const loadPage = async () => {
    setLoading(true);
    setError('');
    setWarning('');
    try {
      const profileData = await getMyHealthProfile();
      const patientId = profileData?.patientId;
      setProfile(profileData);
      setForm({
        fullName: profileData?.fullName || '',
        dateOfBirth: profileData?.dateOfBirth || '',
        gender: profileData?.gender || '',
        phone: profileData?.phone || '',
        address: profileData?.address || '',
      });

      if (!patientId) {
        setHealthData(blankData);
        setWarning('Hồ sơ chưa có mã bệnh nhân nên chưa thể tải dữ liệu y tế chi tiết.');
        return;
      }

      const results = await Promise.allSettled([
        getPatientMedicalRecords(patientId),
        getMyPrescriptions(patientId),
        getMyServiceRequests(patientId),
        getMyHealthMetrics(patientId),
        getHealthMetricSummary(patientId),
      ]);
      const failed = results.filter((item) => item.status === 'rejected' && !is404(item.reason));
      setHealthData({
        records: sortDesc(results[0].status === 'fulfilled' ? results[0].value : [], 'createdAt'),
        prescriptions: sortDesc(results[1].status === 'fulfilled' ? results[1].value : [], 'createdAt'),
        requests: sortDesc(results[2].status === 'fulfilled' ? results[2].value : [], 'createdAt'),
        metrics: sortDesc(results[3].status === 'fulfilled' ? results[3].value : [], 'measuredAt'),
        summary: results[4].status === 'fulfilled' ? results[4].value : null,
      });
      if (failed.length > 0) setWarning('Một số dữ liệu trong hồ sơ sức khỏe chưa tải được. Vui lòng thử lại sau.');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải hồ sơ sức khỏe. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Họ tên không được để trống';
    else if (form.fullName.trim().length > 100) next.fullName = 'Họ tên không vượt quá 100 ký tự';
    if (form.phone && form.phone.length > 20) next.phone = 'Số điện thoại không vượt quá 20 ký tự';
    if (form.address && form.address.length > 255) next.address = 'Địa chỉ không vượt quá 255 ký tự';
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      if (Number.isNaN(dob.getTime()) || dob > new Date()) next.dateOfBirth = 'Ngày sinh không hợp lệ';
    }
    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await updateMyHealthProfile({
        fullName: form.fullName.trim(),
        dateOfBirth: form.dateOfBirth || null,
        gender: form.gender || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      });
      setProfile((current) => ({ ...current, ...updated }));
      setEditing(false);
      showToast('Cập nhật hồ sơ thành công.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Lưu thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      fullName: profile?.fullName || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
    });
    setFormErrors({});
    setEditing(false);
  };

  const age = calcAge(profile?.dateOfBirth);
  const latestMetric = useMemo(() => healthData.summary || healthData.metrics[0] || null, [healthData]);
  const completedRequests = healthData.requests.filter((item) => item.status === 'COMPLETED').length;
  const followUp = healthData.records.find((item) => item.recommendedFollowUpDate);
  const dobText = profile?.dateOfBirth ? fmtDate(profile.dateOfBirth) + (age !== null ? ' (' + age + ' tuổi)' : '') : null;

  return (
    <PatientLayout>
      <div className="mx-auto max-w-6xl space-y-5 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ sức khỏe</h1>
            <p className="mt-0.5 text-sm text-gray-500">Tổng hợp thông tin cá nhân, bệnh án, đơn thuốc, chỉ định cận lâm sàng và chỉ số sức khỏe.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!loading && <button type="button" onClick={loadPage} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><ArrowPathIcon className="h-4 w-4" />Tải lại</button>}
            {!loading && !error && !editing && <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"><PencilSquareIcon className="h-4 w-4" />Chỉnh sửa</button>}
          </div>
        </div>

        {toast.msg && <div className={(toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700') + ' flex items-center gap-2 rounded-lg border px-4 py-3 text-sm'}>{toast.type === 'success' ? <CheckCircleIcon className="h-5 w-5" /> : <ExclamationCircleIcon className="h-5 w-5" />}{toast.msg}</div>}
        {warning && !loading && !error && <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800"><ExclamationCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />{warning}</div>}
        {loading && <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-400"><ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" /><p className="text-sm">Đang tải hồ sơ sức khỏe...</p></div>}
        {!loading && error && <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}

        {!loading && !error && profile && (
          <>
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white/30 bg-white/20"><UserCircleIcon className="h-12 w-12" /></div>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-bold">{profile.fullName || '—'}</h2>
                    <p className="mt-0.5 text-sm text-blue-50">{profile.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                      {profile.gender && <span className="rounded-full bg-white/20 px-2.5 py-1">{genderLabels[profile.gender] || profile.gender}</span>}
                      {age !== null && <span className="rounded-full bg-white/20 px-2.5 py-1">{age} tuổi</span>}
                      <span className="rounded-full bg-white/20 px-2.5 py-1">Mã BN: {profile.patientId || '—'}</span>
                    </div>
                  </div>
                </div>
                {followUp && <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3"><p className="text-xs font-semibold uppercase tracking-wide text-blue-50">Tái khám gần nhất</p><p className="mt-1 text-lg font-bold">{fmtDate(followUp.recommendedFollowUpDate)}</p></div>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={ClipboardDocumentListIcon} label="Bệnh án" value={healthData.records.length} />
              <Stat icon={DocumentTextIcon} label="Đơn thuốc" value={healthData.prescriptions.length} />
              <Stat icon={BeakerIcon} label="Cận lâm sàng có kết quả" value={completedRequests} />
              <Stat icon={ChartBarIcon} label="Lần đo sức khỏe" value={healthData.metrics.length} />
            </div>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="space-y-5">
                <Panel icon={IdentificationIcon} title="Thông tin cá nhân" subtitle="Thông tin định danh và liên hệ">
                  {!editing ? (
                    <div>
                      <Info icon={IdentificationIcon} label="Họ và tên" value={profile.fullName} />
                      <Info icon={CalendarDaysIcon} label="Ngày sinh" value={dobText} />
                      <Info icon={UserCircleIcon} label="Giới tính" value={genderLabels[profile.gender] || profile.gender} />
                      <Info icon={PhoneIcon} label="Số điện thoại" value={profile.phone} />
                      <Info icon={EnvelopeIcon} label="Email" value={profile.email} />
                      <Info icon={MapPinIcon} label="Địa chỉ" value={profile.address} />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Field label="Họ và tên" error={formErrors.fullName}><input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls(formErrors.fullName)} maxLength={100} /></Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Ngày sinh" error={formErrors.dateOfBirth}><input type="date" value={form.dateOfBirth || ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} max={new Date().toISOString().slice(0, 10)} className={inputCls(formErrors.dateOfBirth)} /></Field>
                        <Field label="Giới tính"><select value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls(false)}><option value="">-- Chọn --</option><option value="Nam">Nam</option><option value="Nu">Nữ</option><option value="Khac">Khác</option></select></Field>
                      </div>
                      <Field label="Số điện thoại" error={formErrors.phone}><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls(formErrors.phone)} maxLength={20} /></Field>
                      <Field label="Địa chỉ" error={formErrors.address}><textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls(formErrors.address)} maxLength={255} /></Field>
                      <Field label="Email"><input value={profile.email || ''} disabled className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400" /></Field>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">{saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                        <button type="button" onClick={handleCancel} disabled={saving} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"><XMarkIcon className="h-4 w-4" />Hủy</button>
                      </div>
                    </div>
                  )}
                </Panel>

                <Panel icon={HeartIcon} title="Chỉ số sức khỏe mới nhất" subtitle={latestMetric ? 'Cập nhật lúc ' + fmtDateTime(latestMetric.measuredAt) : 'Chưa có dữ liệu'}>
                  {latestMetric ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {metricFields.map(([key, label, unit]) => <Metric key={key} label={label} value={latestMetric[key]} unit={unit} />)}
                        <Metric label="BMI" value={latestMetric.bmi} />
                        <Metric label="Đánh giá BMI" value={latestMetric.bmiCategory} />
                      </div>
                      {latestMetric.notes && <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{latestMetric.notes}</p>}
                    </div>
                  ) : <Empty>Chưa có chỉ số sức khỏe nào được ghi nhận.</Empty>}
                </Panel>
              </div>

              <div className="space-y-5">
                <Panel icon={ClipboardDocumentListIcon} title="Bệnh án và chẩn đoán" subtitle="Lịch sử chẩn đoán từ bác sĩ" count={healthData.records.length + ' mục'}>
                  {healthData.records.length === 0 ? <Empty>Chưa có bệnh án hoặc chẩn đoán.</Empty> : (
                    <div className="space-y-3">
                      {healthData.records.map((record) => (
                        <article key={record.recordId} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-gray-900">Bệnh án #{record.recordId}</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><UserIcon className="h-3.5 w-3.5" />BS. {record.doctorName || '—'}</p></div><span className="text-xs text-gray-400">{fmtDateTime(record.createdAt)}</span></div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chẩn đoán</p><p className="mt-1 text-sm text-gray-700">{record.diagnosis || '—'}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Hướng điều trị</p><p className="mt-1 text-sm text-gray-700">{record.treatmentPlan || '—'}</p></div></div>
                          <div className="mt-3 flex flex-wrap gap-2">{record.recommendedFollowUpDate && <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Tái khám: {fmtDate(record.recommendedFollowUpDate)}</span>}{record.hasPrescription && <span className="rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Có đơn thuốc</span>}</div>
                        </article>
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel icon={DocumentTextIcon} title="Đơn thuốc" subtitle="Thuốc đã được bác sĩ kê" count={healthData.prescriptions.length + ' đơn'}>
                  {healthData.prescriptions.length === 0 ? <Empty>Chưa có đơn thuốc trong hồ sơ.</Empty> : (
                    <div className="space-y-3">
                      {healthData.prescriptions.map((rx) => (
                        <article key={rx.prescriptionId} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-gray-900">Đơn #{rx.prescriptionId}</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><UserIcon className="h-3.5 w-3.5" />BS. {rx.doctorName || '—'}</p></div><span className="text-xs text-gray-400">{fmtDateTime(rx.createdAt)}</span></div>
                          {rx.notes && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{rx.notes}</p>}
                          <div className="mt-3 space-y-2">{arr(rx.details).length === 0 ? <p className="text-sm text-gray-400">Không có thông tin thuốc.</p> : arr(rx.details).map((detail, index) => <div key={index} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"><p className="text-sm font-semibold text-gray-800">{detail.medicineName || '—'}</p><p className="mt-0.5 text-xs text-gray-500">{detail.dosage || '—'} · {detail.frequency || '—'} · {detail.durationDays || 0} ngày</p></div>)}</div>
                        </article>
                      ))}
                    </div>
                  )}
                </Panel>
                <Panel icon={BeakerIcon} title="Chỉ định cận lâm sàng" subtitle="Xét nghiệm, chẩn đoán hình ảnh và kết quả" count={healthData.requests.length + ' chỉ định'}>
                  {healthData.requests.length === 0 ? <Empty>Chưa có chỉ định cận lâm sàng.</Empty> : (
                    <div className="space-y-3">
                      {healthData.requests.map((request) => (
                        <article key={request.requestId} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div><p className="text-sm font-bold text-gray-900">{request.serviceName || 'Dịch vụ cận lâm sàng'}</p><p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><UserIcon className="h-3.5 w-3.5" />BS. {request.doctorName || '—'}</p></div>
                            <span className="w-fit rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{statusLabels[request.status] || request.status || 'Chưa rõ'}</span>
                          </div>
                          <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Lý do chỉ định</p><p className="mt-1 text-sm text-gray-700">{request.indicationReason || '—'}</p></div><div className="rounded-lg bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Chi phí</p><p className="mt-1 text-sm text-gray-700">{fmtMoney(request.basePrice)}</p></div></div>
                          {request.resultSummary && <div className="mt-3 rounded-lg border border-green-100 bg-green-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Kết quả</p><p className="mt-1 text-sm text-green-800">{request.resultSummary}</p></div>}
                          <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400"><span>Chỉ định: {fmtDateTime(request.createdAt)}</span>{request.performedAt && <span>Thực hiện: {fmtDateTime(request.performedAt)}</span>}</div>
                        </article>
                      ))}
                    </div>
                  )}
                </Panel>

                <Panel icon={ChartBarIcon} title="Lịch sử đo chỉ số" subtitle="Các lần bệnh nhân ghi nhận gần đây" count={healthData.metrics.length + ' lần đo'}>
                  {healthData.metrics.length === 0 ? <Empty>Chưa có lịch sử đo chỉ số sức khỏe.</Empty> : (
                    <div className="space-y-3">
                      {healthData.metrics.slice(0, 6).map((metric) => (
                        <article key={metric.metricId} className="rounded-lg border border-gray-200 p-4">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-bold text-gray-900">{fmtDateTime(metric.measuredAt)}</p>{metric.bmiCategory && <span className="w-fit rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700">BMI: {metric.bmi} - {metric.bmiCategory}</span>}</div>
                          <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4"><Metric label="Huyết áp" value={metric.systolicBp && metric.diastolicBp ? metric.systolicBp + '/' + metric.diastolicBp : null} unit="mmHg" /><Metric label="Nhịp tim" value={metric.heartRate} unit="bpm" /><Metric label="Cân nặng" value={metric.weight} unit="kg" /><Metric label="SpO2" value={metric.spO2} unit="%" /></div>
                          {metric.notes && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{metric.notes}</p>}
                        </article>
                      ))}
                      {healthData.metrics.length > 6 && <p className="text-center text-xs text-gray-400">Hiển thị 6 lần đo mới nhất trong hồ sơ tổng hợp.</p>}
                    </div>
                  )}
                </Panel>
              </div>
            </div>
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default HealthProfilePage;