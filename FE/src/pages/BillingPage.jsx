import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import { getMyInvoices, payInvoice } from '../services/api';
import {
  CurrencyDollarIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  DocumentTextIcon,
  BanknotesIcon,
  BuildingLibraryIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckSolid } from '@heroicons/react/24/solid';

// ─── Constants ────────────────────────────────────────────────────────────────

const BANK_INFO = {
  accountNumber: '050145653735',
  bankId:        'sacombank',       // mã VietQR
  accountName:   'NGUYEN DUONG TRUNG HIEU',
  bankName:      'Sacombank',
};

// VietQR URL: https://img.vietqr.io/image/{bankId}-{accountNumber}-{template}.png
// compact2 = QR kèm logo ngân hàng + số TK + tên TK
const buildQRUrl = (amount, description) =>
  `https://img.vietqr.io/image/${BANK_INFO.bankId}-${BANK_INFO.accountNumber}-compact2.png` +
  `?amount=${Math.round(amount)}` +
  `&addInfo=${encodeURIComponent(description)}` +
  `&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const formatDateTime = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

const formatDate = (str) => {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS = {
  UNPAID:       { label: 'Chưa thanh toán',          color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-400' },
  PENDING_CASH: { label: 'Chờ xác nhận tại quầy',    color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  PAID:         { label: 'Đã thanh toán',             color: 'bg-green-100 text-green-700 border-green-200',   dot: 'bg-green-500'  },
};
const getStatus = (key) => STATUS[key] || STATUS.UNPAID;
const INVOICE_TYPE_LABEL = { CLINICAL_EXAM: 'Phí khám', CLINICAL_SERVICE: 'Dịch vụ cận lâm sàng' };

const StatusBadge = ({ status }) => {
  const cfg = getStatus(status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── CopyButton ───────────────────────────────────────────────────────────────

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition shrink-0"
    >
      {copied
        ? <><CheckCircleIcon className="h-3.5 w-3.5 text-green-500" /> Đã sao chép</>
        : <><ClipboardDocumentIcon className="h-3.5 w-3.5" /> Sao chép</>
      }
    </button>
  );
};

// ─── PayModal ─────────────────────────────────────────────────────────────────

const PayModal = ({ invoice, onPaid, onClose }) => {
  const [step, setStep] = useState('choose');   // 'choose' | 'cash' | 'transfer' | 'success'
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState('');

  const qrDescription = `TTVIENPHI HD${invoice.invoiceId}`;
  const qrUrl = buildQRUrl(invoice.totalAmount, qrDescription);

  const handlePay = async (method) => {
    setSaving(true);
    setApiError('');
    try {
      const updated = await payInvoice(invoice.invoiceId, { paymentMethod: method });
      setStep('success');
      setTimeout(() => onPaid(updated), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Thanh toán thất bại. Vui lòng thử lại.');
      setSaving(false);
    }
  };

  // ── Shared header ────────────────────────────────────────────────────────────
  const Header = ({ title }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
      <div className="flex items-center gap-2">
        {step !== 'choose' && (
          <button
            onClick={() => { setStep('choose'); setApiError(''); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
        <XMarkIcon className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );

  // ── Invoice summary ──────────────────────────────────────────────────────────
  const InvoiceSummary = () => (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Hóa đơn</span>
        <span className="font-semibold text-gray-700">#{invoice.invoiceId}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Bác sĩ</span>
        <span className="font-medium text-gray-800">BS. {invoice.doctorName}</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Chuyên khoa</span>
        <span className="font-medium text-gray-800">{invoice.specialtyName}</span>
      </div>
      <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">Tổng tiền</span>
        <span className="text-xl font-bold text-blue-600">{formatCurrency(invoice.totalAmount)}</span>
      </div>
    </div>
  );

  // ── Step: Choose ─────────────────────────────────────────────────────────────
  if (step === 'choose') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <Header title="Thanh toán hóa đơn" />
        <div className="px-6 py-5 space-y-4">
          <InvoiceSummary />
          <p className="text-sm font-semibold text-gray-700">Chọn phương thức thanh toán</p>
          <div className="space-y-3">
            {/* Tiền mặt */}
            <button
              onClick={() => setStep('cash')}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
            >
              <div className="p-2.5 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition shrink-0">
                <BanknotesIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Tiền mặt</p>
                <p className="text-xs text-gray-400 mt-0.5">Thanh toán trực tiếp tại quầy thu ngân</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Chuyển khoản */}
            <button
              onClick={() => setStep('transfer')}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-left group"
            >
              <div className="p-2.5 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition shrink-0">
                <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-800">Chuyển khoản ngân hàng</p>
                <p className="text-xs text-gray-400 mt-0.5">Quét mã QR hoặc chuyển khoản thủ công</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Step: Cash ───────────────────────────────────────────────────────────────
  if (step === 'cash') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <Header title="Thanh toán tiền mặt" />
        <div className="px-6 py-5 space-y-4">
          <InvoiceSummary />

          {/* Hướng dẫn */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-bold text-amber-800 flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5" />
              Hướng dẫn thanh toán tiền mặt
            </p>
            <ol className="space-y-2">
              {[
                'Mang theo hóa đơn này đến quầy thu ngân tầng 1',
                `Thông báo mã hóa đơn: #${invoice.invoiceId}`,
                `Chuẩn bị số tiền: ${formatCurrency(invoice.totalAmount)}`,
                'Nhân viên sẽ xác nhận và cập nhật trạng thái thanh toán',
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-amber-900">
                  <span className="h-5 w-5 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>

          {/* Giờ làm việc */}
          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100 text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <span>Quầy thu ngân làm việc: <span className="font-semibold text-gray-800">7:00 – 17:00</span>, thứ Hai – thứ Bảy</span>
          </div>

          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => handlePay('CASH')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition disabled:opacity-60"
          >
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang xử lý...' : 'Xác nhận thanh toán tiền mặt'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step: Transfer ────────────────────────────────────────────────────────────
  if (step === 'transfer') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <Header title="Chuyển khoản ngân hàng" />
        <div className="px-6 py-5 space-y-4">
          <InvoiceSummary />

          {/* QR Code */}
          <div className="flex flex-col items-center gap-3 bg-blue-50 rounded-xl border border-blue-100 p-5">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Quét mã QR để thanh toán</p>
            <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
              <img
                src={qrUrl}
                alt="QR chuyển khoản"
                className="h-52 w-52 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              Mở app ngân hàng → Quét mã QR → Kiểm tra thông tin → Xác nhận
            </p>
          </div>

          {/* Thông tin tài khoản */}
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thông tin chuyển khoản</p>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: 'Ngân hàng',    value: BANK_INFO.bankName,      copy: false },
                { label: 'Số tài khoản', value: BANK_INFO.accountNumber, copy: true  },
                { label: 'Chủ tài khoản', value: BANK_INFO.accountName, copy: false },
                { label: 'Số tiền',      value: formatCurrency(invoice.totalAmount), copy: false },
                { label: 'Nội dung CK',  value: qrDescription,           copy: true  },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between px-4 py-2.5 gap-3">
                  <span className="text-sm text-gray-500 shrink-0">{row.label}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate">{row.value}</span>
                    {row.copy && <CopyButton text={row.value} />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lưu ý */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800 space-y-1">
            <p className="font-semibold">Lưu ý quan trọng:</p>
            <p>Nhập <span className="font-semibold">đúng nội dung chuyển khoản</span> để hệ thống tự động xác nhận thanh toán của bạn.</p>
          </div>

          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <ExclamationCircleIcon className="h-5 w-5 shrink-0 mt-0.5" />
              {apiError}
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => handlePay('BANK_TRANSFER')}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
          >
            {saving ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <CheckCircleIcon className="h-4 w-4" />}
            {saving ? 'Đang xử lý...' : 'Xác nhận đã chuyển khoản'}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Step: Success ─────────────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center justify-center py-12 px-6 gap-4">
          <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckSolid className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Thanh toán thành công!</h2>
          <p className="text-sm text-gray-500 text-center">
            Hóa đơn <span className="font-semibold text-gray-700">#{invoice.invoiceId}</span> đã được ghi nhận.
          </p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(invoice.totalAmount)}</p>
        </div>
      </div>
    </div>
  );

  return null;
};

// ─── InvoiceCard ──────────────────────────────────────────────────────────────

const InvoiceCard = ({ invoice, onPay }) => (
  <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden ${
    invoice.status === 'UNPAID' ? 'border-orange-100' : invoice.status === 'PENDING_CASH' ? 'border-yellow-100' : 'border-gray-200'
  }`}>
    <div className={`h-1 ${invoice.status === 'UNPAID' ? 'bg-gradient-to-r from-orange-400 to-orange-300' : invoice.status === 'PENDING_CASH' ? 'bg-gradient-to-r from-yellow-400 to-yellow-300' : 'bg-gradient-to-r from-green-400 to-green-300'}`} />
    <div className="p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-start gap-4 min-w-0">
          <div className={`p-2.5 rounded-xl shrink-0 ${invoice.status === 'UNPAID' ? 'bg-orange-100' : invoice.status === 'PENDING_CASH' ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <DocumentTextIcon className={`h-5 w-5 ${invoice.status === 'UNPAID' ? 'text-orange-600' : invoice.status === 'PENDING_CASH' ? 'text-yellow-700' : 'text-green-600'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Hóa đơn #{invoice.invoiceId}</p>
                            <StatusBadge status={invoice.status} />
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${invoice.invoiceType === 'CLINICAL_SERVICE' ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                {INVOICE_TYPE_LABEL[invoice.invoiceType] || 'Hóa đơn'}
              </span>
            </div>
            <p className="text-base font-bold text-gray-900">BS. {invoice.doctorName}</p>
            <p className="text-sm text-blue-600 font-medium">{invoice.description || invoice.specialtyName}</p>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3.5 w-3.5" />
                {formatDate(invoice.appointmentDate)}
              </span>
              {invoice.status === 'PAID' && invoice.paidAt && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Đã thanh toán {formatDateTime(invoice.paidAt)}
                </span>
              )}
              {invoice.status === 'PAID' && invoice.paymentMethod && (
                <span className="text-gray-400">
                  · {invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : invoice.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : invoice.paymentMethod}
                </span>
              )}
              {invoice.status === 'PENDING_CASH' && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <ClockIcon className="h-3.5 w-3.5" />
                  Vui lòng đến quầy thu ngân để hoàn tất
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className={`text-xl font-bold ${invoice.status === 'UNPAID' ? 'text-orange-600' : invoice.status === 'PENDING_CASH' ? 'text-yellow-700' : 'text-green-600'}`}>
            {formatCurrency(invoice.totalAmount)}
          </p>
          {(invoice.status === 'UNPAID') && (
            <button
              onClick={() => onPay(invoice)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              <CurrencyDollarIcon className="h-4 w-4" />
              Thanh toán
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'UNPAID',       label: 'Chưa thanh toán' },
  { value: 'PENDING_CASH', label: 'Chờ xác nhận tại quầy' },
  { value: 'PAID',         label: 'Đã thanh toán' },
];

const BillingPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMyInvoices();
        setInvoices(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.response?.status === 404) setInvoices([]);
        else setError(err.response?.data?.message || 'Không thể tải danh sách hóa đơn.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePaid = (updated) => {
    setInvoices(prev => prev.map(inv => inv.invoiceId === updated.invoiceId ? updated : inv));
    setPayingInvoice(null);
    showToast('Thanh toán thành công!');
  };

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = !statusFilter || inv.status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        inv.doctorName?.toLowerCase().includes(q) ||
        inv.specialtyName?.toLowerCase().includes(q) ||
        inv.description?.toLowerCase().includes(q) ||
        String(inv.invoiceId).includes(q);
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, search]);

  const stats = useMemo(() => ({
    total:         invoices.length,
    unpaid:        invoices.filter(i => i.status === 'UNPAID').length,
    pendingCash:   invoices.filter(i => i.status === 'PENDING_CASH').length,
    paid:          invoices.filter(i => i.status === 'PAID').length,
    totalAmount:   invoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    paidAmount:    invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + (i.totalAmount || 0), 0),
    unpaidAmount:  invoices.filter(i => ['UNPAID','PENDING_CASH'].includes(i.status)).reduce((s, i) => s + (i.totalAmount || 0), 0),
  }), [invoices]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hóa đơn & Thanh toán</h1>
          <p className="text-sm text-gray-500 mt-0.5">Xem và thanh toán viện phí của bạn</p>
        </div>

        {toast && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            <CheckCircleIcon className="h-5 w-5 shrink-0" />
            {toast}
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Tổng hóa đơn</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              <p className="text-sm font-semibold text-gray-500 mt-0.5">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
              <p className="text-xs text-orange-400 mb-1">Chưa thanh toán</p>
              <p className="text-2xl font-bold text-orange-600">{stats.unpaid}</p>
              <p className="text-sm font-semibold text-orange-500 mt-0.5">{formatCurrency(stats.unpaidAmount)}</p>
            </div>
            <div className="bg-green-50 rounded-xl px-4 py-3 border border-green-100">
              <p className="text-xs text-green-500 mb-1">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              <p className="text-sm font-semibold text-green-500 mt-0.5">{formatCurrency(stats.paidAmount)}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo bác sĩ, chuyên khoa, mã hóa đơn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none cursor-pointer"
            >
              {FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-400">Đang tải hóa đơn...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-xl text-sm">
            <ExclamationCircleIcon className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <CurrencyDollarIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">
              {invoices.length === 0 ? 'Chưa có hóa đơn nào' : 'Không tìm thấy hóa đơn phù hợp'}
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">Hiển thị {filtered.length} / {invoices.length} hóa đơn</p>
            {filtered.map(inv => (
              <InvoiceCard key={inv.invoiceId} invoice={inv} onPay={setPayingInvoice} />
            ))}
          </div>
        )}
      </div>

      {payingInvoice && (
        <PayModal
          invoice={payingInvoice}
          onPaid={handlePaid}
          onClose={() => setPayingInvoice(null)}
        />
      )}
    </PatientLayout>
  );
};

export default BillingPage;
