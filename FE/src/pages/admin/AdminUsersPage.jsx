import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getAdminUserAccounts, toggleAdminUserStatus } from '../../services/api';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  IdentificationIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const roleLabels = {
  PATIENT: 'Bệnh nhân',
  DOCTOR: 'Bác sĩ',
  ADMIN: 'Quản trị viên',
};

const roleStyles = {
  PATIENT: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  DOCTOR: 'bg-blue-50 text-blue-700 border-blue-200',
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
};

const fmtDate = (value) => {
  if (!value) return '—';
  const date = new Date(String(value).includes('T') ? value : String(value) + 'T00:00:00');
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN');
};

const RoleBadge = ({ role }) => (
  <span className={'rounded-full border px-2.5 py-1 text-xs font-semibold ' + (roleStyles[role] || 'bg-gray-50 text-gray-600 border-gray-200')}>
    {roleLabels[role] || role || 'Không rõ'}
  </span>
);

const AccountCard = ({ account, onToggle, toggling }) => {
  const profileId = account.role === 'PATIENT' ? account.patientId : account.role === 'DOCTOR' ? account.doctorId : account.userId;
  const profileLabel = account.role === 'PATIENT' ? 'Mã BN' : account.role === 'DOCTOR' ? 'Mã BS' : 'User ID';

  return (
    <article className={'rounded-xl border bg-sky-50/90 p-4 shadow-md shadow-sky-100 transition hover:shadow-lg ' + (account.active ? 'border-blue-100' : 'border-blue-100 opacity-70')}>
      <div className="flex items-start gap-3">
        <div className={account.active ? 'rounded-full bg-blue-100 p-2.5' : 'rounded-full bg-gray-100 p-2.5'}>
          <UserCircleIcon className={account.active ? 'h-6 w-6 text-blue-600' : 'h-6 w-6 text-gray-400'} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-gray-900">{account.displayName || account.email || 'Tài khoản'}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <RoleBadge role={account.role} />
                <span className={account.active ? 'rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700' : 'rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-500'}>
                  {account.active ? 'Đang hoạt động' : 'Đã khóa'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onToggle(account)}
              disabled={toggling === account.userId}
              className={account.active
                ? 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 disabled:opacity-60'
                : 'inline-flex items-center justify-center gap-1.5 rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-600 hover:bg-green-50 disabled:opacity-60'}
            >
              {toggling === account.userId ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : account.active ? <LockClosedIcon className="h-4 w-4" /> : <LockOpenIcon className="h-4 w-4" />}
              {account.active ? 'Khóa' : 'Mở khóa'}
            </button>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-gray-500 sm:grid-cols-2">
            <p className="flex min-w-0 items-center gap-1"><IdentificationIcon className="h-3.5 w-3.5 shrink-0" />{profileLabel}: {profileId || '—'} · User #{account.userId}</p>
            {account.email && <p className="flex min-w-0 items-center gap-1 truncate"><EnvelopeIcon className="h-3.5 w-3.5 shrink-0" />{account.email}</p>}
            {account.phone && <p className="flex min-w-0 items-center gap-1"><PhoneIcon className="h-3.5 w-3.5 shrink-0" />{account.phone}</p>}
            {account.specialtyName && <p className="truncate">Chuyên khoa: {account.specialtyName}</p>}
            {account.roomNumber && <p>Phòng: {account.roomNumber}</p>}
            {account.dateOfBirth && <p>Ngày sinh: {fmtDate(account.dateOfBirth)}</p>}
            {account.gender && <p>Giới tính: {account.gender}</p>}
          </div>
          {account.address && <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">{account.address}</p>}
        </div>
      </div>
    </article>
  );
};
const AdminUsersPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [toggling, setToggling] = useState(null);
  const [toast, setToast] = useState({ msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminUserAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải danh sách tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchRole = !role || account.role === role;
      const matchStatus = !status || (status === 'ACTIVE' ? account.active : !account.active);
      const matchSearch = !q
        || account.displayName?.toLowerCase().includes(q)
        || account.email?.toLowerCase().includes(q)
        || account.phone?.toLowerCase().includes(q)
        || String(account.userId || '').includes(q)
        || String(account.patientId || '').includes(q)
        || String(account.doctorId || '').includes(q);
      return matchRole && matchStatus && matchSearch;
    });
  }, [accounts, role, search, status]);

  const stats = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter((item) => item.active).length,
    locked: accounts.filter((item) => !item.active).length,
    patients: accounts.filter((item) => item.role === 'PATIENT').length,
    doctors: accounts.filter((item) => item.role === 'DOCTOR').length,
    admins: accounts.filter((item) => item.role === 'ADMIN').length,
  }), [accounts]);

  const handleToggle = async (account) => {
    const nextActive = !account.active;
    setToggling(account.userId);
    try {
      const updated = await toggleAdminUserStatus(account.userId, nextActive);
      setAccounts((current) => current.map((item) => item.userId === updated.userId ? updated : item));
      showToast(nextActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Thao tác thất bại.', 'error');
    } finally {
      setToggling(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Quản lý tài khoản người dùng</h2>
            <p className="mt-0.5 text-sm text-gray-400">Theo dõi và khóa/mở khóa tài khoản bệnh nhân, bác sĩ và quản trị viên</p>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <ArrowPathIcon className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Tải lại
          </button>
        </div>

        {!loading && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Tổng tài khoản</p></div>
          <div className="rounded-xl border border-gray-100 bg-green-50 px-4 py-3"><p className="text-2xl font-bold text-green-700">{stats.active}</p><p className="text-xs text-gray-500">Hoạt động</p></div>
          <div className="rounded-xl border border-gray-100 bg-orange-50 px-4 py-3"><p className="text-2xl font-bold text-orange-700">{stats.locked}</p><p className="text-xs text-gray-500">Đã khóa</p></div>
          <div className="rounded-xl border border-gray-100 bg-cyan-50 px-4 py-3"><p className="text-2xl font-bold text-cyan-700">{stats.patients}</p><p className="text-xs text-gray-500">Bệnh nhân</p></div>
          <div className="rounded-xl border border-gray-100 bg-blue-50 px-4 py-3"><p className="text-2xl font-bold text-blue-700">{stats.doctors}</p><p className="text-xs text-gray-500">Bác sĩ</p></div>
          <div className="rounded-xl border border-gray-100 bg-purple-50 px-4 py-3"><p className="text-2xl font-bold text-purple-700">{stats.admins}</p><p className="text-xs text-gray-500">Admin</p></div>
        </div>}

        {toast.msg && <div className={(toast.type === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700') + ' flex items-center gap-2 rounded-lg border px-4 py-3 text-sm'}>{toast.type === 'error' ? <ExclamationCircleIcon className="h-5 w-5" /> : <CheckCircleIcon className="h-5 w-5" />}{toast.msg}</div>}

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_170px_170px]">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, email, số điện thoại, mã tài khoản..." className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Tất cả vai trò</option>
              <option value="PATIENT">Bệnh nhân</option>
              <option value="DOCTOR">Bác sĩ</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
          </select>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}
        {!loading && !error && filtered.length === 0 && <div className="flex flex-col items-center gap-3 py-20 text-gray-400"><UsersIcon className="h-14 w-14 text-gray-200" /><p className="text-base font-semibold text-gray-500">Không có tài khoản phù hợp</p></div>}

        <div className="grid gap-3 lg:grid-cols-2">
          {!loading && !error && filtered.map((account) => <AccountCard key={account.userId} account={account} onToggle={handleToggle} toggling={toggling} />)}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;