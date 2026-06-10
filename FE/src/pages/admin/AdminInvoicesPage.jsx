import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { adminGetAllInvoices } from '../../services/api';
import {
  MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, ExclamationCircleIcon,
  CalendarDaysIcon, CheckCircleIcon, ClockIcon, DocumentTextIcon,
} from '@heroicons/react/24/outline';

const fmtCurrency = (n) => new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(n||0);
const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtDateTime = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

const STATUS_CFG = {
  UNPAID: { label:'Chưa thanh toán', color:'bg-orange-100 text-orange-700 border-orange-200', dot:'bg-orange-400' },
  PAID:   { label:'Đã thanh toán',   color:'bg-green-100 text-green-700 border-green-200',   dot:'bg-green-500' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_CFG[status] || STATUS_CFG.UNPAID;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border ${c.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />{c.label}
    </span>
  );
};

const PAYMENT_LABEL = { CASH:'Tiền mặt', BANK_TRANSFER:'Chuyển khoản', CARD:'Thẻ' };

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'UNPAID', label: 'Chưa thanh toán' },
  { value: 'PAID', label: 'Đã thanh toán' },
];

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const data = await adminGetAllInvoices();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (e) {
        // BE chưa có GET /api/invoices (all) → hiển thị trống, không báo lỗi
        setInvoices([]);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      const matchStatus = !statusFilter || inv.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        inv.doctorName?.toLowerCase().includes(q) ||
        inv.specialtyName?.toLowerCase().includes(q) ||
        String(inv.invoiceId).includes(q) ||
        String(inv.patientId).includes(q);
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, search]);

  const stats = useMemo(() => ({
    total:        invoices.length,
    paid:         invoices.filter(i => i.status === 'PAID').length,
    unpaid:       invoices.filter(i => i.status === 'UNPAID').length,
    totalRevenue: invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.totalAmount || 0), 0),
  }), [invoices]);

  return (
    <AdminLayout>
      <div className="space-y-5 max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-gray-900">Quản lý hóa đơn</h2>

        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Tổng',             value: stats.total,        color: 'text-gray-800',   bg: 'bg-gray-50' },
              { label: 'Đã thanh toán',    value: stats.paid,         color: 'text-green-700',  bg: 'bg-green-50' },
              { label: 'Chưa thanh toán',  value: stats.unpaid,       color: 'text-orange-600', bg: 'bg-orange-50' },
              { label: 'Tổng doanh thu',   value: fmtCurrency(stats.totalRevenue), color: 'text-blue-700', bg: 'bg-blue-50' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl px-4 py-3 border border-gray-100`}>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Tìm theo bác sĩ, chuyên khoa, mã HĐ, mã BN..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer">
              {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />{error}
          </div>
        )}

        {!loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 text-xs text-gray-400">
              Hiển thị {filtered.length} / {invoices.length} hóa đơn
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 font-semibold">Mã HĐ</th>
                    <th className="px-4 py-3 font-semibold">Mã BN</th>
                    <th className="px-4 py-3 font-semibold">Bác sĩ</th>
                    <th className="px-4 py-3 font-semibold">Chuyên khoa</th>
                    <th className="px-4 py-3 font-semibold">Ngày khám</th>
                    <th className="px-4 py-3 font-semibold">Số tiền</th>
                    <th className="px-4 py-3 font-semibold">Trạng thái</th>
                    <th className="px-4 py-3 font-semibold">PT thanh toán</th>
                    <th className="px-4 py-3 font-semibold">Thanh toán lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">
                      <DocumentTextIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
                      Không có hóa đơn nào
                    </td></tr>
                  ) : filtered.map(inv => (
                    <tr key={inv.invoiceId} className="hover:bg-gray-50 transition text-sm">
                      <td className="px-4 py-3 font-semibold text-gray-700">#{inv.invoiceId}</td>
                      <td className="px-4 py-3 text-gray-500">{inv.patientId}</td>
                      <td className="px-4 py-3 text-gray-700">BS. {inv.doctorName}</td>
                      <td className="px-4 py-3 text-gray-500">{inv.specialtyName}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" />{fmtDate(inv.appointmentDate)}</div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{fmtCurrency(inv.totalAmount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.paymentMethod ? (PAYMENT_LABEL[inv.paymentMethod] || inv.paymentMethod) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {inv.paidAt ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircleIcon className="h-3.5 w-3.5" />{fmtDateTime(inv.paidAt)}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-orange-400">
                            <ClockIcon className="h-3.5 w-3.5" />Chờ thanh toán
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInvoicesPage;
