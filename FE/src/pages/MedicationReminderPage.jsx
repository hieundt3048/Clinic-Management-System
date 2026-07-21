import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  getActiveReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
  getMyPrescriptions,
  getStoredUser,
} from '../services/api';
import {
  BellIcon,
  BellSlashIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolid } from '@heroicons/react/24/solid';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str + 'T00:00:00').toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const formatTime = (str) => {
  if (!str) return '—';
  return str.slice(0, 5);
};

const isExpired = (endDate) => endDate && new Date(endDate + 'T23:59:59') < new Date();


const ReminderField = ({ label, required, error, children }) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}{required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);
// ─── ReminderCard ─────────────────────────────────────────────────────────────

const ReminderCard = ({ reminder, onToggle, onDelete, toggling, deleting }) => {
  const expired = isExpired(reminder.endDate);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`rounded-xl border bg-sky-50/90 shadow-md shadow-sky-100 transition-all ${
      !reminder.active || expired ? 'border-slate-200 opacity-70' : 'border-sky-200 hover:shadow-lg'
    }`}>
      <div className="p-4 flex items-start gap-4">
        <div className={`mt-0.5 p-2.5 rounded-xl shrink-0 ${
          reminder.active && !expired ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {reminder.active && !expired
            ? <BellSolid className="h-5 w-5 text-blue-600" />
            : <BellSlashIcon className="h-5 w-5 text-gray-400" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-0.5">
                Lịch nhắc uống thuốc
              </p>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span className="flex items-center gap-1 text-sm font-bold text-gray-900">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  {formatTime(reminder.reminderTime)}
                </span>
                <span className="text-gray-300">·</span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <CalendarDaysIcon className="h-4 w-4" />
                  {formatDate(reminder.startDate)} – {formatDate(reminder.endDate)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {expired && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">Hết hạn</span>
              )}
              {!expired && (
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  reminder.active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {reminder.active ? 'Đang bật' : 'Đã tắt'}
                </span>
              )}

            </div>
          </div>

          {reminder.note && (
            <p className="mt-2 text-xs text-gray-600 bg-white rounded-lg px-3 py-1.5 border border-sky-100">
              📝 {reminder.note}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-sky-200 bg-sky-100/40 px-4 py-2.5 flex items-center gap-2">
        {!expired && (
          <button
            onClick={() => onToggle(reminder.reminderId, !reminder.active)}
            disabled={toggling === reminder.reminderId}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition border ${
              reminder.active
                ? 'border-orange-200 text-orange-600 hover:bg-orange-50'
                : 'border-green-200 text-green-600 hover:bg-green-50'
            } disabled:opacity-50`}
          >
            {toggling === reminder.reminderId
              ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
              : reminder.active ? <BellSlashIcon className="h-3.5 w-3.5" /> : <BellIcon className="h-3.5 w-3.5" />
            }
            {reminder.active ? 'Tắt nhắc' : 'Bật nhắc'}
          </button>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition ml-auto"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            Xóa
          </button>
        ) : (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Xác nhận xóa?</span>
            <button
              onClick={() => { onDelete(reminder.reminderId); setConfirmDelete(false); }}
              disabled={deleting === reminder.reminderId}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              {deleting === reminder.reminderId ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin inline" /> : 'Xóa'}
            </button>
            <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Hủy
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CreateModal ──────────────────────────────────────────────────────────────

const CreateModal = ({ prescriptions, patientId, onCreated, onClose }) => {
  const [form, setForm] = useState({
    prescriptionId: '',
    reminderTime: '08:00',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    note: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePrescriptionChange = (val) => {
    set('prescriptionId', val);
    if (val) {
      const p = prescriptions.find(p => String(p.prescriptionId) === String(val));
      const maxDays = p?.details?.reduce((m, d) => Math.max(m, d.durationDays || 0), 0);
      if (maxDays) {
        const end = new Date();
        end.setDate(end.getDate() + maxDays);
        set('endDate', end.toISOString().slice(0, 10));
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.prescriptionId) errs.prescriptionId = 'Vui lòng chọn đơn thuốc';
    if (!form.reminderTime) errs.reminderTime = 'Vui lòng chọn giờ nhắc';
    if (!form.startDate) errs.startDate = 'Vui lòng chọn ngày bắt đầu';
    if (!form.endDate) errs.endDate = 'Vui lòng chọn ngày kết thúc';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      errs.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError('');
    try {
      const created = await createReminder(patientId, {
        prescriptionId: Number(form.prescriptionId),
        reminderTime: form.reminderTime + ':00',
        startDate: form.startDate,
        endDate: form.endDate,
        note: form.note.trim() || null,
      });
      onCreated(created);
    } catch (err) {
      setApiError(err.response?.data?.message || err.response?.data || 'Tạo lịch nhắc thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
      err ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
    }`;


  const selectedPrescription = prescriptions.find(p => String(p.prescriptionId) === String(form.prescriptionId));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Tạo lịch nhắc uống thuốc</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}

          <ReminderField label="Đơn thuốc" required error={errors.prescriptionId}>
            <select value={form.prescriptionId} onChange={e => handlePrescriptionChange(e.target.value)} className={inputCls(errors.prescriptionId)}>
              <option value="">-- Chọn đơn thuốc --</option>
              {prescriptions.length === 0 && <option disabled>Bạn chưa có đơn thuốc nào</option>}
              {prescriptions.map(p => (
                <option key={p.prescriptionId} value={p.prescriptionId}>
                  Đơn thuốc của BS. {p.doctorName}
                  {p.createdAt ? ` (${new Date(p.createdAt).toLocaleDateString('vi-VN')})` : ''}
                </option>
              ))}
            </select>
          </ReminderField>

          {selectedPrescription?.details?.length > 0 && (
            <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100 space-y-1">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Thuốc trong đơn</p>
              {selectedPrescription.details.map((d, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <BeakerIcon className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <span className="text-gray-700">
                    <span className="font-medium">{d.medicineName}</span>
                    {d.dosage && ` — ${d.dosage}`}
                    {d.frequency && ` · ${d.frequency}`}
                    {d.durationDays && ` · ${d.durationDays} ngày`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <ReminderField label="Giờ nhắc" required error={errors.reminderTime}>
            <input type="time" value={form.reminderTime} onChange={e => set('reminderTime', e.target.value)} className={inputCls(errors.reminderTime)} />
          </ReminderField>

          <div className="grid grid-cols-2 gap-3">
            <ReminderField label="Ngày bắt đầu" required error={errors.startDate}>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} className={inputCls(errors.startDate)} />
            </ReminderField>
            <ReminderField label="Ngày kết thúc" required error={errors.endDate}>
              <input type="date" value={form.endDate} min={form.startDate} onChange={e => set('endDate', e.target.value)} className={inputCls(errors.endDate)} />
            </ReminderField>
          </div>

          <ReminderField label="Ghi chú">
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              rows={2}
              placeholder="Uống sau khi ăn, không uống với sữa..."
              className={inputCls(false)}
              maxLength={255}
            />
          </ReminderField>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang tạo...' : 'Tạo lịch nhắc'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const MedicationReminderPage = () => {
  const [reminders, setReminders] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    if (!patientId) {
      setError('Không tìm thấy thông tin bệnh nhân. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const [remindersRes, prescriptionsRes] = await Promise.allSettled([
          getActiveReminders(patientId),
          getMyPrescriptions(patientId),
        ]);
        if (remindersRes.status === 'fulfilled') setReminders(remindersRes.value || []);
        if (prescriptionsRes.status === 'fulfilled') setPrescriptions(prescriptionsRes.value || []);
      } catch {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId]);

  const handleToggle = async (id, active) => {
    setToggling(id);
    try {
      const updated = await toggleReminder(id, active);
      setReminders(prev => prev.map(r => r.reminderId === id ? updated : r));
      showToast(active ? 'Đã bật nhắc nhở!' : 'Đã tắt nhắc nhở!');
    } catch {
      showToast('Thao tác thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.reminderId !== id));
      showToast('Đã xóa lịch nhắc!');
    } catch {
      showToast('Xóa thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const { active, inactive } = useMemo(() => ({
    active:   reminders.filter(r => r.active && !isExpired(r.endDate)),
    inactive: reminders.filter(r => !r.active || isExpired(r.endDate)),
  }), [reminders]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Nhắc uống thuốc</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý lịch nhắc nhở uống thuốc của bạn</p>
          </div>
          {!loading && !error && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-4 w-4" />
              Tạo nhắc nhở
            </button>
          )}
        </div>

        {toast.msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {toast.type === 'success' ? <CheckCircleIcon className="h-5 w-5 shrink-0" /> : <ExclamationCircleIcon className="h-5 w-5 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tổng', value: reminders.length, color: 'text-sky-800', bg: 'bg-sky-50' },
              { label: 'Đang bật', value: active.length, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Tắt / Hết hạn', value: inactive.length, color: 'text-slate-600', bg: 'bg-slate-100' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-sky-200 shadow-sm`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/80 py-16 gap-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">Đang tải...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && reminders.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-sky-200 bg-sky-50/80 py-16 gap-3 text-sky-500">
            <BellSlashIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Chưa có lịch nhắc nào</p>
            <p className="text-sm">Nhấn "Tạo nhắc nhở" để bắt đầu</p>
          </div>
        )}

        {!loading && !error && active.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" />
              Đang hoạt động ({active.length})
            </h2>
            {active.map(r => (
              <ReminderCard key={r.reminderId} reminder={r} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
            ))}
          </section>
        )}

        {!loading && !error && inactive.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300 inline-block" />
              Đã tắt / Hết hạn ({inactive.length})
            </h2>
            {inactive.map(r => (
              <ReminderCard key={r.reminderId} reminder={r} onToggle={handleToggle} onDelete={handleDelete} toggling={toggling} deleting={deleting} />
            ))}
          </section>
        )}
      </div>

      {showModal && (
        <CreateModal
          prescriptions={prescriptions}
          patientId={patientId}
          onCreated={(newReminder) => { setReminders(prev => [newReminder, ...prev]); setShowModal(false); showToast('Tạo lịch nhắc thành công!'); }}
          onClose={() => setShowModal(false)}
        />
      )}
    </PatientLayout>
  );
};

export default MedicationReminderPage;

