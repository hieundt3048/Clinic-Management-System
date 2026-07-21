import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { getRevenue } from '../../services/api';
import {
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', notation: 'compact', maximumFractionDigits: 1 }).format(n || 0);

const fmtFull = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const PERIODS = [
  { key: 'day',   label: 'Hôm nay' },
  { key: 'week',  label: 'Tuần này' },
  { key: 'month', label: 'Tháng này' },
  { key: 'year',  label: 'Năm nay' },
];

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className={`text-2xl font-bold ${color || 'text-gray-800'}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl ${color === 'text-blue-600' ? 'bg-blue-50' : color === 'text-green-600' ? 'bg-green-50' : 'bg-orange-50'}`}>
        <Icon className={`h-5 w-5 ${color || 'text-gray-500'}`} />
      </div>
    </div>
  </div>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: <span className="font-bold">{fmtFull(p.value)}</span></p>
      ))}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const AdminRevenuePage = () => {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        // GET /api/revenue-report/{day|week|month|year}
        const res = await getRevenue(period);
        setData(res);
      } catch (e) {
        setError(e.response?.data?.message || 'Không thể tải báo cáo.');
      } finally { setLoading(false); }
    };
    load();
  }, [period]);

  // Chuẩn bị dữ liệu chart
  const trendData = data?.revenueByDate?.map(d => ({
    date: new Date(d.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
    'Doanh thu': Number(d.revenue) || 0,
    'Hóa đơn': d.invoiceCount,
  })) || [];

  const doctorData = (data?.revenueByDoctor || [])
    .slice(0, 8)
    .map(d => ({ name: d.doctorName?.split(' ').slice(-1)[0] || d.doctorName, 'Doanh thu': Number(d.totalRevenue) || 0, 'HĐ': d.invoiceCount }));

  const specialtyData = (data?.revenueBySpecialty || [])
    .map(d => ({ name: d.specialtyName, value: Number(d.totalRevenue) || 0, count: d.invoiceCount }));

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-6xl mx-auto">

        {/* Header + period picker */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Báo cáo doanh thu</h2>
            {data?.periodLabel && <p className="text-sm text-gray-400 mt-0.5">{data.periodLabel}</p>}
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                  period === p.key ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {!loading && data && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={CurrencyDollarIcon} label="Tổng doanh thu" value={fmt(data.totalRevenue)} sub={fmtFull(data.totalRevenue)} color="text-blue-600" />
              <StatCard icon={DocumentCheckIcon}  label="Đã thanh toán"  value={data.totalInvoicesPaid}   sub="hóa đơn" color="text-green-600" />
              <StatCard icon={ClockIcon}           label="Chưa thanh toán" value={data.totalInvoicesUnpaid} sub="hóa đơn" color="text-orange-500" />
              <StatCard icon={CalendarDaysIcon}    label="TB mỗi hóa đơn" value={fmt(data.averageInvoiceValue)} color="text-blue-600" />
            </div>

            {/* Trend chart */}
            {trendData.length > 0 && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Xu hướng doanh thu</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={v => fmt(v)} tick={{ fontSize: 11 }} width={70} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="Doanh thu" stroke="#2563eb" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Doctor + Specialty charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {doctorData.length > 0 && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo bác sĩ</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={doctorData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Doanh thu" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {specialtyData.length > 0 && (
                <div className="rounded-xl border border-sky-200 bg-sky-50/90 p-5 shadow-md shadow-sky-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">Doanh thu theo chuyên khoa</h3>
                  <div className="space-y-2.5">
                    {specialtyData.map((s, i) => {
                      const max = Math.max(...specialtyData.map(x => x.value));
                      const pct = max ? (s.value / max) * 100 : 0;
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span className="font-medium">{s.name}</span>
                            <span>{fmt(s.value)} <span className="text-gray-400">({s.count} HĐ)</span></span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRevenuePage;
