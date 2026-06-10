import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getAllDoctors, createStaff } from '../../services/api';
import {
  UserPlusIcon, ArrowPathIcon, ExclamationCircleIcon,
  CheckCircleIcon, XMarkIcon, UserCircleIcon, EnvelopeIcon,
  PhoneIcon, BeakerIcon,
} from '@heroicons/react/24/outline';

// ─── CreateStaffModal ─────────────────────────────────────────────────────────

const CreateStaffModal = ({ onCreated, onClose }) => {
  const [role, setRole] = useState('DOCTOR');
  const [form, setForm] = useState({ email:'', password:'', confirmPassword:'', fullName:'', phone:'', dateOfBirth:'', gender:'' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Họ tên không được để trống';
    if (!form.email.trim()) e.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password) e.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu xác nhận không khớp';
    if (form.phone && !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.phone)) e.phone = 'Số điện thoại không hợp lệ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError('');
    try {
      // POST /api/auth/create-staff?role=DOCTOR|ADMIN
      await createStaff({ ...form, confirmPassword: form.confirmPassword }, role);
      onCreated(role);
    } catch (e) {
      setApiError(e.response?.data?.message || e.response?.data || 'Tạo tài khoản thất bại.');
    } finally { setSaving(false); }
  };

  const inputCls = (err) =>
    `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  const Field = ({ label, required, error, children }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Tạo tài khoản nhân viên</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />{apiError}
            </div>
          )}

          {/* Role */}
          <Field label="Vai trò" required>
            <div className="flex gap-2">
              {[{ v:'DOCTOR', l:'Bác sĩ' }, { v:'ADMIN', l:'Admin' }].map(r => (
                <button key={r.v} onClick={() => setRole(r.v)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg border-2 transition ${role === r.v ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  {r.l}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Họ và tên" required error={errors.fullName}>
            <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
              placeholder="Nguyễn Văn A" className={inputCls(errors.fullName)} maxLength={100} />
          </Field>

          <Field label="Email" required error={errors.email}>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="doctor@ttsclinic.vn" className={inputCls(errors.email)} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mật khẩu" required error={errors.password}>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)}
                placeholder="••••••••" className={inputCls(errors.password)} />
            </Field>
            <Field label="Xác nhận mật khẩu" required error={errors.confirmPassword}>
              <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                placeholder="••••••••" className={inputCls(errors.confirmPassword)} />
            </Field>
          </div>

          <Field label="Số điện thoại" error={errors.phone}>
            <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="0901234567" className={inputCls(errors.phone)} maxLength={10} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày sinh">
              <input type="date" value={form.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                max={new Date().toISOString().slice(0,10)} className={inputCls(false)} />
            </Field>
            <Field label="Giới tính">
              <select value={form.gender} onChange={e => set('gender', e.target.value)} className={inputCls(false)}>
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Khac">Khác</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">Hủy</button>
        </div>
      </div>
    </div>
  );
};

// ─── DoctorCard ────────────────────────────────────────────────────────────────

const DoctorCard = ({ doctor }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex items-start gap-4">
    <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <UserCircleIcon className="h-6 w-6 text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-bold text-gray-900 truncate">BS. {doctor.fullName || doctor.name}</p>
      <p className="text-xs text-blue-600 font-medium mt-0.5 flex items-center gap-1">
        <BeakerIcon className="h-3.5 w-3.5" />{doctor.specialtyName || '—'}
      </p>
      <div className="mt-1.5 space-y-0.5">
        {doctor.email && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <EnvelopeIcon className="h-3 w-3" />{doctor.email}
          </p>
        )}
        {doctor.phone && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <PhoneIcon className="h-3 w-3" />{doctor.phone}
          </p>
        )}
        {doctor.roomNumber && (
          <p className="text-xs text-gray-400">Phòng: {doctor.roomNumber}</p>
        )}
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminStaffPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/catalog/doctors
        const data = await getAllDoctors();
        setDoctors(Array.isArray(data) ? data : []);
      } catch (e) {
        setError('Không thể tải danh sách bác sĩ.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý nhân viên</h2>
            <p className="text-sm text-gray-400 mt-0.5">Tạo tài khoản bác sĩ và admin</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            <UserPlusIcon className="h-4 w-4" />
            Tạo tài khoản
          </button>
        </div>

        {toast && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <CheckCircleIcon className="h-5 w-5 shrink-0" />{toast}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3 inline-flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-700">{doctors.length}</span>
            <span className="text-sm text-blue-600">bác sĩ trong hệ thống</span>
          </div>
        )}

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {!loading && !error && (
          doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <UserCircleIcon className="h-14 w-14 text-gray-200" />
              <p className="text-base font-medium text-gray-500">Chưa có bác sĩ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctors.map(d => <DoctorCard key={d.doctorId || d.userId} doctor={d} />)}
            </div>
          )
        )}
      </div>

      {showModal && (
        <CreateStaffModal
          onCreated={(role) => {
            setShowModal(false);
            showToast(`Tạo tài khoản ${role === 'DOCTOR' ? 'bác sĩ' : 'admin'} thành công!`);
            // Reload nếu tạo bác sĩ
            if (role === 'DOCTOR') {
              getAllDoctors().then(data => setDoctors(Array.isArray(data) ? data : [])).catch(() => {});
            }
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminStaffPage;
