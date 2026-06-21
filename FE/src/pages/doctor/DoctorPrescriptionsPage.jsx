import React, { useState, useEffect, useMemo } from 'react';
import DoctorLayout from './DoctorLayout';
import { getDoctorAppointments, createPrescription, getStoredUser } from '../../services/api';
import {
  DocumentTextIcon, PlusIcon, TrashIcon, ArrowPathIcon,
  ExclamationCircleIcon, CheckCircleIcon, XMarkIcon,
  BeakerIcon, UserIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';

const emptyMed = () => ({ medicineName:'', dosage:'', frequency:'', durationDays:'' });

const CreateModal = ({ appointments, onCreated, onClose }) => {
  const [recordId, setRecordId]   = useState('');
  const [notes, setNotes]         = useState('');
  const [meds, setMeds]           = useState([emptyMed()]);
  const [errors, setErrors]       = useState({});
  const [saving, setSaving]       = useState(false);
  const [apiError, setApiError]   = useState('');

  // Chọn lịch hẹn đã COMPLETED để kê đơn
  const completedAppts = appointments.filter(a => a.status === 'COMPLETED');

  const setMed = (i, k, v) => setMeds(prev => prev.map((m, idx) => idx === i ? {...m, [k]: v} : m));
  const addMed = () => setMeds(prev => [...prev, emptyMed()]);
  const removeMed = (i) => setMeds(prev => prev.filter((_, idx) => idx !== i));

  const validate = () => {
    const e = {};
    if (!recordId) e.recordId = 'Vui lòng chọn lịch hẹn';
    meds.forEach((m, i) => {
      if (!m.medicineName.trim()) e[`med_${i}_name`] = 'Tên thuốc không được trống';
      if (!m.dosage.trim())       e[`med_${i}_dosage`] = 'Liều dùng không được trống';
      if (!m.frequency.trim())    e[`med_${i}_freq`] = 'Tần suất không được trống';
      if (!m.durationDays || m.durationDays < 1) e[`med_${i}_days`] = 'Số ngày ≥ 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError('');
    try {
      // POST /api/prescriptions  body: { recordId, notes, details }
      // Lưu ý: BE dùng recordId — nhưng hiện tại appointmentId đang thay thế cho recordId
      // nếu BE chưa có bảng MedicalRecord, truyền appointmentId vào recordId
      const created = await createPrescription({
        recordId: Number(recordId),
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
      setApiError(e.response?.data?.message || JSON.stringify(e.response?.data) || 'Kê đơn thất bại.');
    } finally { setSaving(false); }
  };

  const inputCls = (err) =>
    `w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Kê đơn thuốc mới</h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{apiError}
            </div>
          )}

          {/* Chọn lịch hẹn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lịch hẹn <span className="text-red-500">*</span>
              <span className="text-xs text-gray-400 font-normal ml-1">(chỉ hiện lịch đã hoàn thành)</span>
            </label>
            <select value={recordId} onChange={e => setRecordId(e.target.value)}
              className={inputCls(errors.recordId)}>
              <option value="">-- Chọn lịch hẹn --</option>
              {completedAppts.length === 0 && <option disabled>Không có lịch hẹn đã hoàn thành</option>}
              {completedAppts.map(a => (
                <option key={a.appointmentId} value={a.appointmentId}>
                  #{a.appointmentId} — {a.patientName} ({fmtDate(a.appointmentDate)})
                </option>
              ))}
            </select>
            {errors.recordId && <p className="mt-1 text-xs text-red-500">{errors.recordId}</p>}
          </div>

          {/* Danh sách thuốc */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Danh sách thuốc</p>
              <button onClick={addMed}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition">
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
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cho bệnh nhân</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              rows={2} placeholder="Uống sau ăn, tránh dùng rượu bia..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100 sticky bottom-0 bg-white">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-60 transition">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Kê đơn thuốc'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">Hủy</button>
        </div>
      </div>
    </div>
  );
};

// ─── PrescriptionCard ─────────────────────────────────────────────────────────
const PrescriptionCard = ({ rx }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-100 shrink-0">
            <DocumentTextIcon className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-teal-600 font-semibold uppercase tracking-wide">Đơn #{rx.prescriptionId}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1">
              <UserIcon className="h-3.5 w-3.5 text-gray-400" />{rx.patientName}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <CalendarDaysIcon className="h-3 w-3" />
              {rx.createdAt ? new Date(rx.createdAt).toLocaleString('vi-VN') : '—'}
            </p>
            {rx.notes && <p className="text-xs text-gray-500 mt-1 italic">"{rx.notes}"</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
            {rx.details?.length || 0} thuốc
          </span>
          <button onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {expanded && rx.details?.length > 0 && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-2">
          {rx.details.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <BeakerIcon className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-gray-800">{d.medicineName}</span>
                <span className="text-gray-500"> — {d.dosage} · {d.frequency} · {d.durationDays} ngày</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

import { ChevronDownIcon } from '@heroicons/react/24/outline';

const DoctorPrescriptionsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState({ msg:'', type:'' });

  const user = getStoredUser();
  const doctorId = user?.doctorId ?? user?.userId;

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(() => setToast({msg:'',type:''}), 3000); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const appts = await getDoctorAppointments(doctorId);
        setAppointments(Array.isArray(appts) ? appts : []);
        // Lấy đơn thuốc từ các lịch hẹn COMPLETED
        // BE: GET /api/prescriptions/patient/{patientId} — không có endpoint by doctor
        // Tạm lấy từ lịch hẹn completed và fetch prescription per appointment
        // (hoặc chờ BE thêm endpoint)
      } catch { } finally { setLoading(false); }
    };
    if (doctorId) load();
  }, [doctorId]);

  return (
    <DoctorLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kê đơn thuốc</h2>
            <p className="text-sm text-gray-400 mt-0.5">Kê đơn cho bệnh nhân sau khám</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition">
            <PlusIcon className="h-4 w-4" />Kê đơn mới
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

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-teal-500" /></div>}

        {!loading && prescriptions.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <DocumentTextIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Chưa có đơn thuốc nào</p>
            <p className="text-sm">Nhấn "Kê đơn mới" để bắt đầu</p>
          </div>
        )}

        {prescriptions.map(rx => <PrescriptionCard key={rx.prescriptionId} rx={rx} />)}
      </div>

      {showModal && (
        <CreateModal
          appointments={appointments}
          onCreated={(rx) => {
            setPrescriptions(prev => [rx, ...prev]);
            setShowModal(false);
            showToast('Kê đơn thuốc thành công!');
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </DoctorLayout>
  );
};

export default DoctorPrescriptionsPage;
