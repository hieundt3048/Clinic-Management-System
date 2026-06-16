import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import {
  getAllDoctors, createStaff, updateDoctor,
  toggleDoctorStatus, deleteDoctor, getSpecialties,
} from '../../services/api';
import {
  UserPlusIcon, ArrowPathIcon, ExclamationCircleIcon,
  CheckCircleIcon, XMarkIcon, UserCircleIcon, EnvelopeIcon,
  PhoneIcon, BeakerIcon, PencilSquareIcon, TrashIcon,
  LockClosedIcon, LockOpenIcon, MapPinIcon,
} from '@heroicons/react/24/outline';

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

const Field = ({ label, required, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const EditModal = ({ doctor, specialties, onSaved, onClose }) => {
  const [form, setForm] = useState({
    fullName:    doctor.fullName    || '',
    specialtyId: doctor.specialtyId || '',
    roomNumber:  doctor.roomNumber  || '',
    phone:       doctor.phone       || '',
  });
  const [errors, setErrors]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Họ tên không được để trống';
    if (!form.specialtyId)     e.specialtyId = 'Vui lòng chọn chuyên khoa';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError('');
    try {
      // PUT /api/doctors/{id}
      const updated = await updateDoctor(doctor.doctorId, {
        fullName:    form.fullName.trim(),
        specialtyId: Number(form.specialtyId),
        roomNumber:  form.roomNumber.trim() || null,
        phone:       form.phone.trim()      || null,
      });
      onSaved(updated);
    } catch (e) {
      setApiError(e.response?.data?.message || 'Cập nhật thất bại.');
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Chỉnh sửa thông tin bác sĩ</h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{apiError}
            </div>
          )}
          <Field label="Họ và tên" required error={errors.fullName}>
            <input type="text" value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              className={inputCls(errors.fullName)} maxLength={100} />
          </Field>
          <Field label="Chuyên khoa" required error={errors.specialtyId}>
            <select value={form.specialtyId} onChange={e => set('specialtyId', e.target.value)}
              className={inputCls(errors.specialtyId)}>
              <option value="">-- Chọn chuyên khoa --</option>
              {specialties.map(s => (
                <option key={s.specialtyId} value={s.specialtyId}>{s.specialtyName}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Phòng khám">
              <input type="text" value={form.roomNumber}
                onChange={e => set('roomNumber', e.target.value)}
                placeholder="VD: A101" className={inputCls(false)} maxLength={50} />
            </Field>
            <Field label="Số điện thoại">
              <input type="tel" value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className={inputCls(false)} maxLength={20} />
            </Field>
          </div>
          {/* Email readonly */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={doctor.email || ''} disabled
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed" />
            <p className="mt-1 text-xs text-gray-400">Email không thể thay đổi</p>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition">
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50 transition">Hủy</button>
        </div>
      </div>
    </div>
  );
};

// ─── CreateModal ──────────────────────────────────────────────────────────────

const CreateModal = ({ onCreated, onClose, specialties }) => {
  const [form, setForm] = useState({
    email: '', password: '', confirmPassword: '',
    fullName: '', phone: '', specialtyId: '', roomNumber: '',
  });
  const [errors, setErrors]     = useState({});
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())    e.fullName = 'Họ tên không được để trống';
    if (!form.email.trim())       e.email = 'Email không được để trống';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.password)           e.password = 'Mật khẩu không được để trống';
    else if (form.password.length < 6) e.password = 'Ít nhất 6 ký tự';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Mật khẩu không khớp';
    if (!form.specialtyId)        e.specialtyId = 'Vui lòng chọn chuyên khoa';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true); setApiError('');
    try {
      await createStaff({
        fullName:        form.fullName.trim(),
        email:           form.email.trim(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
        phone:           form.phone.trim() || null,
        specialtyId:     Number(form.specialtyId),
        roomNumber:      form.roomNumber.trim() || null,
      }, 'DOCTOR');
      onCreated();
    } catch (e) {
      const data = e.response?.data;
      // Spring @Valid trả { errors: { fieldName: "message" } }
      if (data?.errors && typeof data.errors === 'object') {
        const fieldMap = {
          fullName: 'fullName', email: 'email',
          password: 'password', confirmPassword: 'confirmPassword',
          phone: 'phone', specialtyId: 'specialtyId', roomNumber: 'roomNumber',
        };
        const fieldErrors = {};
        let hasField = false;
        Object.entries(data.errors).forEach(([k, msg]) => {
          fieldErrors[fieldMap[k] || k] = msg;
          hasField = true;
        });
        if (hasField) { setErrors(prev => ({ ...prev, ...fieldErrors })); setSaving(false); return; }
      }
      // Fallback: thông báo chung
      const msg = data?.message || (typeof data === 'string' ? data : null) || 'Tạo tài khoản thất bại.';
      setApiError(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Thêm bác sĩ mới</h2>
          <button onClick={onClose}><XMarkIcon className="h-5 w-5 text-gray-400" /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{apiError}
            </div>
          )}
          <Field label="Họ và tên" required error={errors.fullName}>
            <input type="text" value={form.fullName} onChange={e => set('fullName', e.target.value)}
              placeholder="Nguyễn Văn A" className={inputCls(errors.fullName)} />
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
          <Field label="Chuyên khoa" required error={errors.specialtyId}>
            <select value={form.specialtyId} onChange={e => set('specialtyId', e.target.value)}
              className={inputCls(errors.specialtyId)}>
              <option value="">-- Chọn chuyên khoa --</option>
              {(specialties || []).map(s => (
                <option key={s.specialtyId} value={s.specialtyId}>{s.specialtyName}</option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số điện thoại">
              <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                className={inputCls(false)} maxLength={10} />
            </Field>
            <Field label="Phòng khám">
              <input type="text" value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)}
                placeholder="VD: A101" className={inputCls(false)} maxLength={50} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày sinh">
              <input type="date" disabled
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed" />
            </Field>
            <Field label="Giới tính">
              <select disabled
                className="w-full px-3 py-2.5 text-sm border border-gray-100 rounded-lg bg-gray-50 text-gray-300 cursor-not-allowed">
                <option value="">-- Chọn --</option>
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
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

const DoctorCard = ({ doctor, onEdit, onToggle, onDelete, toggling, deleting }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`bg-white rounded-xl border shadow-sm transition-all hover:shadow-md ${
      !doctor.active ? 'opacity-60 border-gray-200' : 'border-blue-100'
    }`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
            doctor.active ? 'bg-blue-100' : 'bg-gray-100'
          }`}>
            <UserCircleIcon className={`h-6 w-6 ${doctor.active ? 'text-blue-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">BS. {doctor.fullName}</p>
                <p className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                  <BeakerIcon className="h-3.5 w-3.5" />{doctor.specialtyName}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                doctor.active
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : 'bg-gray-100 text-gray-500 border-gray-200'
              }`}>
                {doctor.active ? 'Hoạt động' : 'Đã khoá'}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {doctor.email && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <EnvelopeIcon className="h-3 w-3 shrink-0" />{doctor.email}
                </p>
              )}
              {doctor.phone && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <PhoneIcon className="h-3 w-3 shrink-0" />{doctor.phone}
                </p>
              )}
              {doctor.roomNumber && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <MapPinIcon className="h-3 w-3 shrink-0" />Phòng: {doctor.roomNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-1.5 flex-wrap">
        {/* Edit */}
        <button onClick={() => onEdit(doctor)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
          <PencilSquareIcon className="h-3.5 w-3.5" />Sửa
        </button>

        {/* Toggle lock */}
        <button
          onClick={() => onToggle(doctor.doctorId, !doctor.active)}
          disabled={toggling === doctor.doctorId}
          className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border rounded-lg transition disabled:opacity-50 ${
            doctor.active
              ? 'text-orange-600 border-orange-200 hover:bg-orange-50'
              : 'text-green-600 border-green-200 hover:bg-green-50'
          }`}>
          {toggling === doctor.doctorId
            ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" />
            : doctor.active
              ? <LockClosedIcon className="h-3.5 w-3.5" />
              : <LockOpenIcon className="h-3.5 w-3.5" />
          }
          {doctor.active ? 'Khoá' : 'Mở khoá'}
        </button>

        {/* Delete */}
        <div className="ml-auto">
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
              <TrashIcon className="h-3.5 w-3.5" />Xóa
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500">Xác nhận?</span>
              <button onClick={() => { onDelete(doctor.doctorId); setConfirmDelete(false); }}
                disabled={deleting === doctor.doctorId}
                className="px-2.5 py-1.5 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50">
                {deleting === doctor.doctorId ? <ArrowPathIcon className="h-3 w-3 animate-spin inline" /> : 'Xóa'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50">
                Hủy
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────

const AdminStaffPage = () => {
  const [doctors, setDoctors]       = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [toggling, setToggling]     = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [toast, setToast]           = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  const loadDoctors = async () => {
    try {
      // GET /api/doctors (endpoint mới, trả DoctorDetailResponse với email, phone, active)
      const data = await getAllDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải danh sách bác sĩ.');
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [, specs] = await Promise.all([loadDoctors(), getSpecialties()]);
        setSpecialties(specs || []);
      } finally { setLoading(false); }
    };
    init();
  }, []);

  const handleToggle = async (id, active) => {
    setToggling(id);
    try {
      // PATCH /api/doctors/{id}/status?active=...
      await toggleDoctorStatus(id, active);
      setDoctors(prev => prev.map(d =>
        d.doctorId === id ? { ...d, active } : d
      ));
      showToast(active ? 'Đã mở khoá tài khoản!' : 'Đã khoá tài khoản!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Thao tác thất bại.', 'error');
    } finally { setToggling(null); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      // DELETE /api/doctors/{id}
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.doctorId !== id));
      showToast('Đã xóa bác sĩ!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Xóa thất bại.', 'error');
    } finally { setDeleting(null); }
  };

  const handleSaved = (updated) => {
    setDoctors(prev => prev.map(d =>
      d.doctorId === updated.doctorId ? updated : d
    ));
    setEditTarget(null);
    showToast('Cập nhật thành công!');
  };

  const stats = {
    total:  doctors.length,
    active: doctors.filter(d => d.active).length,
    locked: doctors.filter(d => !d.active).length,
  };

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý nhân viên</h2>
            <p className="text-sm text-gray-400 mt-0.5">Quản lý tài khoản bác sĩ trong hệ thống</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
            <UserPlusIcon className="h-4 w-4" />Thêm bác sĩ
          </button>
        </div>

        {/* Toast */}
        {toast.msg && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm border ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}>
            {toast.type === 'error'
              ? <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
              : <CheckCircleIcon className="h-5 w-5 shrink-0" />}
            {toast.msg}
          </div>
        )}

        {/* Stats */}
        {!loading && (
          <div className="flex gap-3">
            {[
              { label: 'Tổng bác sĩ',    value: stats.total,  color: 'text-gray-800', bg: 'bg-gray-50' },
              { label: 'Đang hoạt động', value: stats.active, color: 'text-green-700', bg: 'bg-green-50' },
              { label: 'Đã khoá',        value: stats.locked, color: 'text-orange-600', bg: 'bg-orange-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-gray-100 flex items-center gap-3`}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}

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

        {!loading && !error && (
          doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <UserCircleIcon className="h-14 w-14 text-gray-200" />
              <p className="text-base font-medium text-gray-500">Chưa có bác sĩ nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {doctors.map(d => (
                <DoctorCard
                  key={d.doctorId}
                  doctor={d}
                  onEdit={setEditTarget}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  toggling={toggling}
                  deleting={deleting}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <CreateModal
          specialties={specialties}
          onCreated={() => {
            setShowCreate(false);
            showToast('Tạo tài khoản bác sĩ thành công!');
            loadDoctors();
          }}
          onClose={() => setShowCreate(false)}
        />
      )}

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          doctor={editTarget}
          specialties={specialties}
          onSaved={handleSaved}
          onClose={() => setEditTarget(null)}
        />
      )}
    </AdminLayout>
  );
};

export default AdminStaffPage;
