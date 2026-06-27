import React, { useState, useEffect } from 'react';
import DoctorLayout from './DoctorLayout';
import {
  getDoctorAppointments, getDoctorMedicalRecords,
  createMedicalRecord, createPrescription, getStoredUser,
} from '../../services/api';
import {
  DocumentTextIcon, PlusIcon, TrashIcon, ArrowPathIcon,
  ExclamationCircleIcon, CheckCircleIcon, XMarkIcon,
  BeakerIcon, UserIcon, CalendarDaysIcon, ClipboardDocumentCheckIcon,
  ArrowRightIcon, ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '—';

const emptyMed = () => ({ medicineName:'', dosage:'', frequency:'', durationDays:'' });

// ─── Modal 2 bước: B1 Tạo bệnh án (chẩn đoán) → B2 Kê đơn thuốc ───────────────

const CreateModal = ({ appointments, onCreated, onClose }) => {
  const [step, setStep] = useState(1); // 1 = chẩn đoán, 2 = kê đơn
  const [appointmentId, setAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [recordId, setRecordId] = useState(null);
  const [recordInfo, setRecordInfo] = useState(null);

  const [notes, setNotes] = useState('');
  const [meds, setMeds] = useState([emptyMed()]);

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');
  const selectedAppt = appointments.find(a => a.appointmentId === Number(appointmentId));

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  // ── Bước 1: Tạo bệnh án ─────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!appointmentId) e.appointmentId = 'Vui lòng chọn lịch hẹn';
    if (!diagnosis.trim()) e.diagnosis = 'Chẩn đoán không được để trống';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreateRecord = async () => {
    if (!validateStep1()) return;
    setSaving(true); setApiError('');
    try {
      // POST /api/medical-records
      const record = await createMedicalRecord({
        appointmentId: Number(appointmentId),
        diagnosis: diagnosis.trim(),
        treatmentPlan: treatmentPlan.trim() || null,
        recommendedFollowUpDate: followUpDate || null,
      });
      setRecordId(record.recordId);
      setRecordInfo(record);
      setStep(2);
    } catch (e) {
      setApiError(e.response?.data?.message || 'Tạo bệnh án thất bại.');
    } finally { setSaving(false); }
  };

  // ── Bước 2: Kê đơn thuốc ─────────────────────────────────────────────────────
  const setMed = (i, k, v) => setMeds(prev => prev.map((m, idx) => idx === i ? {...m, [k]: v} : m));
  const addMed = () => setMeds(prev => [...prev, emptyMed()]);
  const removeMed = (i) => setMeds(prev => prev.filter((_, idx) => idx !== i));

  const validateStep2 = () => {
    const e = {};
    meds.forEach((m, i) => {
      if (!m.medicineName.trim()) e[`med_${i}_name`] = 'Tên thuốc không được trống';
      if (!m.dosage.trim())       e[`med_${i}_dosage`] = 'Liều dùng không được trống';
      if (!m.frequency.trim())    e[`med_${i}_freq`] = 'Tần suất không được trống';
      if (!m.durationDays || m.durationDays < 1) e[`med_${i}_days`] = 'Số ngày ≥ 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreatePrescription = async () => {
    if (!validateStep2()) return;
    setSaving(true); setApiError('');
    try {
      // POST /api/prescriptions — dùng recordId vừa tạo ở bước 1
      const created = await createPrescription({
        recordId: recordId,
        notes: notes.trim() || null,
        details: meds.map(m => ({
          medicineName: m.medicineName.trim(),
          dosage:       m.dosage.trim(),
          frequency:    m.frequency.trim(),
          durationDays: Number(m.durationDays),
        })),
      });
      onCreated(created);
    } catch (e) {
      setApiError(e.response?.data?.message || 'Kê đơn thất bại.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header với step indicator */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {step === 1 ? 'Bước 1: Ghi nhận chẩn đoán' : 'Bước 2: Kê đơn thuốc'}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`h-1.5 w-8 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
              <span className={`h-1.5 w-8 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
            </div>
          </div>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{apiError}
            </div>
          )}

          {/* ── STEP 1: Chẩn đoán ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lịch hẹn <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-400 font-normal ml-1">(chỉ hiện lịch đã hoàn thành)</span>
                </label>
                <select value={appointmentId} onChange={e => setAppointmentId(e.target.value)}
                  className={inputCls(errors.appointmentId)}>
                  <option value="">-- Chọn lịch hẹn --</option>
                  {completedAppts.length === 0 && <option disabled>Không có lịch hẹn đã hoàn thành</option>}
                  {completedAppts.map(a => (
                    <option key={a.appointmentId} value={a.appointmentId}>
                      #{a.appointmentId} — {a.patientName} ({fmtDate(a.appointmentDate)})
                    </option>
                  ))}
                </select>
                {errors.appointmentId && <p className="mt-1 text-xs text-red-500">{errors.appointmentId}</p>}
              </div>

              {selectedAppt && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
                  <UserIcon className="h-4 w-4 inline mr-1" />
                  Bệnh nhân: <span className="font-semibold">{selectedAppt.patientName}</span>
                  {selectedAppt.reason && <p className="mt-1 text-blue-600">Lý do khám: {selectedAppt.reason}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán <span className="text-red-500">*</span>
                </label>
                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                  rows={3} placeholder="VD: Viêm họng cấp, sốt virus..."
                  className={inputCls(errors.diagnosis)} />
                {errors.diagnosis && <p className="mt-1 text-xs text-red-500">{errors.diagnosis}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hướng điều trị</label>
                <textarea value={treatmentPlan} onChange={e => setTreatmentPlan(e.target.value)}
                  rows={2} placeholder="Nghỉ ngơi, uống nhiều nước, tái khám nếu không đỡ..."
                  className={inputCls(false)} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hẹn tái khám (nếu có)</label>
                <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)}
                  min={new Date().toISOString().slice(0,10)}
                  className={inputCls(false)} />
              </div>
            </>
          )}

          {/* ── STEP 2: Kê đơn thuốc ── */}
          {step === 2 && (
            <>
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3 text-sm text-green-700 flex items-center gap-2">
                <ClipboardDocumentCheckIcon className="h-5 w-5 shrink-0" />
                Đã ghi nhận chẩn đoán cho bệnh án #{recordId}. Giờ kê đơn thuốc tương ứng.
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-700">Danh sách thuốc</p>
                <button onClick={addMed}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                  <PlusIcon className="h-3.5 w-3.5" />Thêm thuốc
                </button>
              </div>

              {meds.map((m, i) => (
                <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                      <BeakerIcon className="h-3.5 w-3.5" />Thuốc {i + 1}
                    </p>
                    {meds.length > 1 && (
                      <button onClick={() => removeMed(i)}
                        className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tên thuốc *</label>
                      <input type="text" value={m.medicineName}
                        onChange={e => setMed(i, 'medicineName', e.target.value)}
                        placeholder="Paracetamol 500mg"
                        className={inputCls(errors[`med_${i}_name`])} />
                      {errors[`med_${i}_name`] && <p className="mt-0.5 text-xs text-red-500">{errors[`med_${i}_name`]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Liều dùng *</label>
                      <input type="text" value={m.dosage}
                        onChange={e => setMed(i, 'dosage', e.target.value)}
                        placeholder="1 viên / lần"
                        className={inputCls(errors[`med_${i}_dosage`])} />
                      {errors[`med_${i}_dosage`] && <p className="mt-0.5 text-xs text-red-500">{errors[`med_${i}_dosage`]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Tần suất *</label>
                      <input type="text" value={m.frequency}
                        onChange={e => setMed(i, 'frequency', e.target.value)}
                        placeholder="3 lần / ngày"
                        className={inputCls(errors[`med_${i}_freq`])} />
                      {errors[`med_${i}_freq`] && <p className="mt-0.5 text-xs text-red-500">{errors[`med_${i}_freq`]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Số ngày dùng *</label>
                      <input type="number" value={m.durationDays} min={1}
                        onChange={e => setMed(i, 'durationDays', e.target.value)}
                        placeholder="7"
                        className={inputCls(errors[`med_${i}_days`])} />
                      {errors[`med_${i}_days`] && <p className="mt-0.5 text-xs text-red-500">{errors[`med_${i}_days`]}</p>}
                    </div>
                  </div>
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cho bệnh nhân</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} placeholder="Uống sau ăn, tránh dùng rượu bia..."
                  className={inputCls(false)} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          {step === 1 ? (
            <>
              <button onClick={handleCreateRecord} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <ArrowRightIcon className="h-4 w-4" />}
                {saving ? 'Đang lưu...' : 'Tiếp tục: Kê đơn'}
              </button>
              <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">Hủy</button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(1)} disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">
                <ArrowLeftIcon className="h-4 w-4" />Quay lại
              </button>
              <button onClick={handleCreatePrescription} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
                {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
                {saving ? 'Đang lưu...' : 'Hoàn tất kê đơn'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── RecordCard: hiển thị bệnh án đã tạo ──────────────────────────────────────

const RecordCard = ({ record }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-blue-100 shrink-0">
          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Bệnh án #{record.recordId}</p>
          <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1">
            <UserIcon className="h-3.5 w-3.5 text-gray-400" />{record.patientName}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <CalendarDaysIcon className="h-3 w-3" />{fmtDateTime(record.createdAt)}
          </p>
          <p className="text-sm text-gray-600 mt-2">{record.diagnosis}</p>
        </div>
      </div>
      {record.hasPrescription ? (
        <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-medium shrink-0">
          Đã kê đơn
        </span>
      ) : (
        <span className="text-xs bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium shrink-0">
          Chưa kê đơn
        </span>
      )}
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const DoctorPrescriptionsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ msg:'', type:'' });

  const user = getStoredUser();
  const doctorId = user?.doctorId;

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(() => setToast({msg:'',type:''}), 3000); };

  const load = async () => {
    setLoading(true);
    try {
      const [appts, recs] = await Promise.allSettled([
        getDoctorAppointments(doctorId),
        getDoctorMedicalRecords(doctorId),
      ]);
      if (appts.status === 'fulfilled') setAppointments(Array.isArray(appts.value) ? appts.value : []);
      if (recs.status === 'fulfilled')  setRecords(Array.isArray(recs.value) ? recs.value : []);
    } catch { /* silent */ } finally { setLoading(false); }
  };

  useEffect(() => { if (doctorId) load(); }, [doctorId]);

  return (
    <DoctorLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bệnh án & Kê đơn thuốc</h2>
            <p className="text-sm text-gray-400 mt-0.5">Ghi nhận chẩn đoán và kê đơn cho bệnh nhân sau khám</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            <PlusIcon className="h-4 w-4" />Tạo bệnh án mới
          </button>
        </div>

        {toast.msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" /> : <CheckCircleIcon className="h-5 w-5 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}

        {!loading && records.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <DocumentTextIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Chưa có bệnh án nào</p>
            <p className="text-sm">Nhấn "Tạo bệnh án mới" để bắt đầu</p>
          </div>
        )}

        <div className="space-y-3">
          {records.map(r => <RecordCard key={r.recordId} record={r} />)}
        </div>
      </div>

      {showModal && (
        <CreateModal
          appointments={appointments}
          onCreated={() => {
            setShowModal(false);
            showToast('Kê đơn thuốc thành công!');
            load();
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </DoctorLayout>
  );
};

export default DoctorPrescriptionsPage;
