import React, { useState, useEffect } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyHealthProfile, updateMyHealthProfile } from '../services/api';
import {
  UserCircleIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (str) => {
  if (!str) return '—';
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const calcAge = (str) => {
  if (!str) return null;
  const diff = Date.now() - new Date(str + 'T00:00:00').getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
};

const GENDER_LABEL  = { Nam: 'Nam', Nu: 'Nữ', Khac: 'Khác' };
const GENDER_VALUES = [
  { value: 'Nam',  label: 'Nam' },
  { value: 'Nu',   label: 'Nữ' },
  { value: 'Khac', label: 'Khác' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value, missing }) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-gray-100 last:border-0">
    <div className="mt-0.5 p-2 rounded-lg bg-blue-50 shrink-0">
      <Icon className="h-4 w-4 text-blue-600" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
      {missing
        ? <p className="text-sm text-orange-400 italic mt-0.5">Chưa cập nhật</p>
        : <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">{value}</p>
      }
    </div>
  </div>
);

const Field = ({ label, required, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
      {hint && <span className="text-xs text-gray-400 font-normal ml-2">{hint}</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <ExclamationCircleIcon className="h-3.5 w-3.5" />{error}
      </p>
    )}
  </div>
);

const inputCls = (err) =>
  `w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
  }`;

// ─── Completeness indicator ───────────────────────────────────────────────────

const ProfileCompleteness = ({ profile }) => {
  const fields = ['fullName', 'dateOfBirth', 'gender', 'phone', 'address'];
  const filled = fields.filter(f => profile?.[f]);
  const pct    = Math.round((filled.length / fields.length) * 100);
  const color  = pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-blue-500' : 'bg-orange-400';

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-4 shadow-md shadow-sky-100">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-gray-700">Độ hoàn thiện hồ sơ</p>
        <span className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : pct >= 60 ? 'text-blue-600' : 'text-orange-500'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      {pct < 100 && (
        <p className="text-xs text-gray-400 mt-2">
          Còn {fields.length - filled.length} thông tin chưa cập nhật
        </p>
      )}
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserProfilePage = () => {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [editing, setEditing]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState({ msg: '', type: '' });
  const [form, setForm]         = useState({
    fullName: '', dateOfBirth: '', gender: '', address: '', phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/health-profile/me → ApiResponse<HealthProfileResponse>
        const data = await getMyHealthProfile();
        setProfile(data);
        setForm({
          fullName:    data.fullName    || '',
          dateOfBirth: data.dateOfBirth || '',
          gender:      data.gender      || '',
          address:     data.address     || '',
          phone:       data.phone       || '',
        });
      } catch (e) {
        setError(e.response?.data?.message || 'Không thể tải hồ sơ. Vui lòng thử lại.');
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim())
      errs.fullName = 'Họ tên không được để trống';
    else if (form.fullName.trim().length > 100)
      errs.fullName = 'Họ tên không vượt quá 100 ký tự';
    if (form.phone && form.phone.length > 20)
      errs.phone = 'Số điện thoại không vượt quá 20 ký tự';
    if (form.address && form.address.length > 255)
      errs.address = 'Địa chỉ không vượt quá 255 ký tự';
    if (form.dateOfBirth && new Date(form.dateOfBirth) > new Date())
      errs.dateOfBirth = 'Ngày sinh không hợp lệ';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // PUT /api/health-profile/me → ApiResponse<HealthProfileResponse>
      const updated = await updateMyHealthProfile({
        fullName:    form.fullName.trim(),
        dateOfBirth: form.dateOfBirth  || null,
        gender:      form.gender       || null,
        address:     form.address.trim() || null,
        phone:       form.phone.trim()   || null,
      });
      setProfile(updated);
      setEditing(false);
      showToast('Cập nhật hồ sơ thành công!');
    } catch (e) {
      const data = e.response?.data;
      if (data?.errors && typeof data.errors === 'object') {
        setFormErrors(prev => ({ ...prev, ...data.errors }));
      } else {
        showToast(data?.message || 'Lưu thất bại. Vui lòng thử lại.', 'error');
      }
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({
      fullName:    profile?.fullName    || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender:      profile?.gender      || '',
      address:     profile?.address     || '',
      phone:       profile?.phone       || '',
    });
    setFormErrors({});
    setEditing(false);
  };

  const age = calcAge(profile?.dateOfBirth);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <PatientLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <p className="text-sm text-gray-500 mt-0.5">Quản lý thông tin tài khoản của bạn</p>
          </div>
          {!loading && !error && !editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition">
              <PencilSquareIcon className="h-4 w-4" />
              Chỉnh sửa
            </button>
          )}
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

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">Đang tải hồ sơ...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && profile && (
          <>
            {/* Avatar card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 flex items-center gap-5 text-white shadow-sm">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center shrink-0 border-4 border-white/30">
                <UserCircleIcon className="h-12 w-12 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xl font-bold truncate">{profile.fullName || 'Chưa cập nhật tên'}</h2>
                <p className="text-blue-100 text-sm mt-0.5">{profile.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.gender && (
                    <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">
                      {GENDER_LABEL[profile.gender] || profile.gender}
                    </span>
                  )}
                  {age !== null && (
                    <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full">
                      {age} tuổi
                    </span>
                  )}
                  <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3" />Mã BN: {profile.patientId}
                  </span>
                </div>
              </div>
            </div>

            {/* Completeness */}
            <ProfileCompleteness profile={profile} />

            {/* View mode */}
            {!editing && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                  Thông tin chi tiết
                </h3>
                <InfoRow icon={IdentificationIcon} label="Họ và tên"    value={profile.fullName}  missing={!profile.fullName} />
                <InfoRow icon={CalendarDaysIcon}   label="Ngày sinh"
                  value={profile.dateOfBirth
                    ? `${formatDate(profile.dateOfBirth)}${age !== null ? ` (${age} tuổi)` : ''}`
                    : null}
                  missing={!profile.dateOfBirth} />
                <InfoRow icon={UserCircleIcon} label="Giới tính"
                  value={GENDER_LABEL[profile.gender] || profile.gender}
                  missing={!profile.gender} />
                <InfoRow icon={PhoneIcon}    label="Số điện thoại" value={profile.phone}   missing={!profile.phone} />
                <InfoRow icon={EnvelopeIcon} label="Email"          value={profile.email}   missing={!profile.email} />
                <InfoRow icon={MapPinIcon}   label="Địa chỉ"        value={profile.address} missing={!profile.address} />
              </div>
            )}

            {/* Edit mode */}
            {editing && (
              <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Chỉnh sửa thông tin
                </h3>

                <Field label="Họ và tên" required error={formErrors.fullName}>
                  <input type="text" value={form.fullName}
                    onChange={e => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className={inputCls(formErrors.fullName)} maxLength={100} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Ngày sinh" error={formErrors.dateOfBirth}>
                    <input type="date" value={form.dateOfBirth || ''}
                      onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                      max={new Date().toISOString().slice(0, 10)}
                      className={inputCls(formErrors.dateOfBirth)} />
                  </Field>
                  <Field label="Giới tính">
                    <select value={form.gender || ''}
                      onChange={e => setForm({ ...form, gender: e.target.value })}
                      className={inputCls(false)}>
                      <option value="">-- Chọn --</option>
                      {GENDER_VALUES.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="Số điện thoại" error={formErrors.phone}>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901234567"
                    className={inputCls(formErrors.phone)} maxLength={20} />
                </Field>

                <Field label="Địa chỉ" error={formErrors.address}>
                  <textarea value={form.address}
                    onChange={e => setForm({ ...form, address: e.target.value })}
                    rows={2} placeholder="Số nhà, đường, phường, quận, tỉnh/thành phố"
                    className={inputCls(formErrors.address)} maxLength={255} />
                </Field>

                {/* Email readonly */}
                <Field label="Email" hint="(không thể thay đổi)">
                  <input type="email" value={profile.email || ''} disabled
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed" />
                </Field>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
                    {saving
                      ? <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      : <CheckCircleIcon className="h-4 w-4" />}
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button onClick={handleCancel} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                    <XMarkIcon className="h-4 w-4" />Hủy
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PatientLayout>
  );
};

export default UserProfilePage;
