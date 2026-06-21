import React, { useState, useEffect, useMemo } from 'react';
import PatientLayout from '../components/PatientLayout';
import {
  getAppointmentHistory, getMyHealthMetrics, getStoredUser,
} from '../services/api';
import {
  ClipboardDocumentListIcon, CalendarDaysIcon, UserIcon,
  ArrowPathIcon, ExclamationCircleIcon, HeartIcon,
  BeakerIcon, ChevronDownIcon, MapPinIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '—';

// ─── MetricMini ───────────────────────────────────────────────────────────────
const MetricMini = ({ label, value, unit }) => {
  if (value == null) return null;
  return (
    <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 text-center">
      <p className="text-sm font-bold text-gray-800">{value}<span className="text-xs font-normal ml-0.5">{unit}</span></p>
      <p className="text-[10px] text-gray-400">{label}</p>
    </div>
  );
};

// ─── VisitCard: 1 lần khám hoàn thành ──────────────────────────────────────────
const VisitCard = ({ visit, metric }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full p-4 flex items-start justify-between gap-3 text-left">
        <div className="flex items-start gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-green-100 shrink-0">
            <ClipboardDocumentListIcon className="h-5 w-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">{visit.specialtyName}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">BS. {visit.doctorName}</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-3 w-3" />{fmtDate(visit.appointmentDate)}
              </span>
              {visit.roomNumber && (
                <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{visit.roomNumber}</span>
              )}
            </div>
          </div>
        </div>
        <ChevronDownIcon className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 space-y-3">
          {visit.reason && (
            <p className="text-sm text-gray-600">
              <span className="text-gray-400">Lý do khám:</span> {visit.reason}
            </p>
          )}
          {visit.followUp && (
            <span className="inline-block text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              Tái khám
            </span>
          )}

          {metric && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <HeartIcon className="h-3.5 w-3.5 text-red-400" />Chỉ số sức khỏe ghi nhận
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <MetricMini label="Tâm thu"   value={metric.systolicBp}  unit="mmHg" />
                <MetricMini label="Tâm trương" value={metric.diastolicBp} unit="mmHg" />
                <MetricMini label="Nhịp tim"  value={metric.heartRate}   unit="bpm" />
                <MetricMini label="SpO2"      value={metric.spO2}        unit="%" />
                <MetricMini label="Nhiệt độ"  value={metric.temperature} unit="°C" />
                <MetricMini label="Cân nặng"  value={metric.weight}      unit="kg" />
                <MetricMini label="BMI"       value={metric.bmi?.toFixed(1)} unit="" />
              </div>
              {metric.notes && (
                <p className="text-xs text-gray-500 mt-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  📝 {metric.notes}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

const MedicalHistory = () => {
  const [visits, setVisits]   = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const user = getStoredUser();
  const patientId = user?.patientId ?? user?.userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('');
      try {
        const [apptRes, metricRes] = await Promise.allSettled([
          getAppointmentHistory(patientId),     // GET /api/appointments/history/patient/{id}
          getMyHealthMetrics(patientId),        // GET /api/health-metrics/{patientId}
        ]);
        if (apptRes.status === 'fulfilled') {
          // Chỉ lấy các lịch hẹn đã hoàn thành — đó mới là "bệnh án"
          const completed = (apptRes.value || []).filter(a => a.status === 'COMPLETED');
          setVisits(completed);
        }
        if (metricRes.status === 'fulfilled') {
          setMetrics(metricRes.value || []);
        }
      } catch {
        setError('Không thể tải lịch sử bệnh án.');
      } finally { setLoading(false); }
    };
    if (patientId) load();
  }, [patientId]);

  // Map chỉ số sức khỏe gần nhất với mỗi lần khám (theo ngày gần nhau nhất)
  const visitsWithMetrics = useMemo(() => {
    return visits.map(visit => {
      const visitDate = new Date(visit.appointmentDate);
      // Tìm metric đo trong vòng cùng ngày với lần khám
      const matched = metrics.find(m => {
        const mDate = new Date(m.measuredAt);
        return mDate.toDateString() === visitDate.toDateString();
      });
      return { visit, metric: matched };
    }).sort((a, b) => new Date(b.visit.appointmentDate) - new Date(a.visit.appointmentDate));
  }, [visits, metrics]);

  return (
    <PatientLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử bệnh án</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tổng hợp các lần khám đã hoàn thành và chỉ số sức khỏe</p>
        </div>

        {!loading && !error && (
          <div className="bg-green-50 rounded-xl border border-green-100 px-4 py-3 inline-flex items-center gap-3">
            <span className="text-2xl font-bold text-green-700">{visitsWithMetrics.length}</span>
            <span className="text-sm text-green-600">lần khám đã hoàn thành</span>
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

        {!loading && !error && visitsWithMetrics.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <ClipboardDocumentListIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">Chưa có lần khám nào hoàn thành</p>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-3">
          {visitsWithMetrics.map(({ visit, metric }) => (
            <VisitCard key={visit.appointmentId} visit={visit} metric={metric} />
          ))}
        </div>

        {/* Gợi ý liên kết */}
        {!loading && !error && visitsWithMetrics.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
            <BeakerIcon className="h-4 w-4 shrink-0" />
            Xem chi tiết đơn thuốc và kết quả xét nghiệm tại mục tương ứng trong menu
          </div>
        )}
      </div>
    </PatientLayout>
  );
};

export default MedicalHistory;
