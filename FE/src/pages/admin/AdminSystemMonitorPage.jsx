import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from './AdminLayout';
import { getSystemMonitorSnapshot } from '../../services/api';
import {
  ArrowPathIcon,
  BeakerIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const labels = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
  UNPAID: 'Chưa thanh toán',
  PENDING_CASH: 'Chờ tiền mặt',
  PAID: 'Đã thanh toán',
  IN_PROGRESS: 'Đang thực hiện',
  PATIENT: 'Bệnh nhân',
  DOCTOR: 'Bác sĩ',
  ADMIN: 'Quản trị viên',
};

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
const formatMoney = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
const formatDateTime = (value) => value ? new Date(value).toLocaleString('vi-VN') : '—';

const StatCard = ({ icon: Icon, label, value, helper, tone }) => (
  <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        {helper && <p className="mt-1 text-xs text-gray-400">{helper}</p>}
      </div>
      <div className={'rounded-lg p-2 ' + (tone || 'bg-blue-50')}><Icon className="h-5 w-5 text-blue-600" /></div>
    </div>
  </div>
);

const MetricRows = ({ title, data }) => {
  const entries = Object.entries(data || {});
  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      <div className="mt-4 space-y-3">
        {entries.map(([key, value]) => {
          const percent = total ? Math.round((Number(value || 0) / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-gray-700">{labels[key] || key}</span>
                <span className="text-gray-500">{formatNumber(value)} · {percent}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-blue-500" style={{ width: percent + '%' }} />
              </div>
            </div>
          );
        })}
        {entries.length === 0 && <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>}
      </div>
    </section>
  );
};
const AdminSystemMonitorPage = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSystemMonitorSnapshot();
      setSnapshot(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải dữ liệu giám sát hệ thống.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const healthItems = useMemo(() => {
    if (!snapshot) return [];
    const pendingAppointments = snapshot.appointmentsByStatus?.PENDING || 0;
    const pendingServiceRequests = snapshot.serviceRequestsByStatus?.PENDING || 0;
    const unpaidInvoices = snapshot.invoicesByStatus?.UNPAID || 0;
    return [
      { label: 'Hệ thống API', value: snapshot.status === 'UP' ? 'Ổn định' : 'Cần kiểm tra', good: snapshot.status === 'UP' },
      { label: 'Tài khoản bị khóa', value: formatNumber(snapshot.lockedUsers), good: snapshot.lockedUsers === 0 },
      { label: 'Lịch hẹn chờ xử lý', value: formatNumber(pendingAppointments), good: pendingAppointments < 10 },
      { label: 'CLS chờ thực hiện', value: formatNumber(pendingServiceRequests), good: pendingServiceRequests < 10 },
      { label: 'Hóa đơn chưa thanh toán', value: formatNumber(unpaidInvoices), good: unpaidInvoices < 10 },
    ];
  }, [snapshot]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Giám sát hệ thống</h2>
            <p className="mt-0.5 text-sm text-gray-400">Theo dõi nhanh tình trạng vận hành, tài khoản, lịch hẹn, hóa đơn và chỉ định cận lâm sàng</p>
          </div>
          <button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60">
            <ArrowPathIcon className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />Làm mới
          </button>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><ExclamationCircleIcon className="h-5 w-5" />{error}</div>}

        {!loading && !error && snapshot && (
          <>
            <section className="rounded-2xl bg-gradient-to-r from-blue-700 to-cyan-600 p-6 text-white shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white/20 p-3"><ServerStackIcon className="h-8 w-8" /></div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-blue-50">Trạng thái tổng quan</p>
                    <h3 className="mt-1 text-2xl font-bold">{snapshot.status === 'UP' ? 'Hệ thống đang hoạt động' : 'Hệ thống cần kiểm tra'}</h3>
                    <p className="mt-1 text-sm text-blue-50">Lần kiểm tra: {formatDateTime(snapshot.checkedAt)}</p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/20 bg-white/15 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-50">Reminder đang bật</p>
                  <p className="mt-1 text-2xl font-bold">{formatNumber(snapshot.activeMedicationReminders)} / {formatNumber(snapshot.totalMedicationReminders)}</p>
                </div>
              </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={UsersIcon} label="Tài khoản" value={formatNumber(snapshot.totalUsers)} helper={formatNumber(snapshot.activeUsers) + ' hoạt động'} />
              <StatCard icon={CalendarDaysIcon} label="Lịch hẹn hôm nay" value={formatNumber(snapshot.todayAppointments)} helper={formatNumber(snapshot.totalAppointments) + ' tổng lịch'} tone="bg-cyan-50" />
              <StatCard icon={CurrencyDollarIcon} label="Doanh thu đã thu" value={formatMoney(snapshot.paidRevenue)} helper={'Chưa thu: ' + formatMoney(snapshot.unpaidAmount)} tone="bg-green-50" />
              <StatCard icon={BeakerIcon} label="Chỉ định CLS" value={formatNumber(snapshot.totalServiceRequests)} helper={(snapshot.serviceRequestsByStatus?.PENDING || 0) + ' chờ thực hiện'} tone="bg-purple-50" />
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-bold text-gray-900">Kiểm tra vận hành</h3>
                </div>
                <div className="mt-4 space-y-3">
                  {healthItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className={item.good ? 'inline-flex items-center gap-1 text-sm font-semibold text-green-700' : 'inline-flex items-center gap-1 text-sm font-semibold text-orange-700'}>
                        {item.good ? <CheckCircleIcon className="h-4 w-4" /> : <ClockIcon className="h-4 w-4" />}
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <MetricRows title="Tài khoản theo vai trò" data={snapshot.usersByRole} />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              <MetricRows title="Lịch hẹn theo trạng thái" data={snapshot.appointmentsByStatus} />
              <MetricRows title="Hóa đơn theo trạng thái" data={snapshot.invoicesByStatus} />
              <MetricRows title="Cận lâm sàng theo trạng thái" data={snapshot.serviceRequestsByStatus} />
            </div>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <HeartIcon className="h-5 w-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Nhắc lịch uống thuốc</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Tổng nhắc thuốc</p><p className="mt-2 text-2xl font-bold text-gray-900">{formatNumber(snapshot.totalMedicationReminders)}</p></div>
                <div className="rounded-lg bg-green-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-green-700">Đang hoạt động</p><p className="mt-2 text-2xl font-bold text-green-800">{formatNumber(snapshot.activeMedicationReminders)}</p></div>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSystemMonitorPage;