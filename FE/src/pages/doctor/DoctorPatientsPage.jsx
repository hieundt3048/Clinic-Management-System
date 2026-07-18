import React, { useState, useEffect, useMemo } from 'react';
import DoctorLayout from './DoctorLayout';
import { getDoctorAppointments, getPatientHealthMetrics, getStoredUser } from '../../services/api';
import {
  UserIcon, HeartIcon, ArrowPathIcon, ExclamationCircleIcon,
  MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon,
  BeakerIcon, CalendarDaysIcon,
} from '@heroicons/react/24/outline';

const fmtDate = (s) => s ? new Date(s).toLocaleDateString('vi-VN', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';
const fmtDateTime = (s) => s ? new Date(s).toLocaleString('vi-VN') : '—';

const MetricBadge = ({ label, value, unit, normal }) => {
  if (value == null) return null;
  return (
    <div className={`flex flex-col items-center px-3 py-2 rounded-xl border text-center ${
      normal === false ? 'bg-red-50 border-red-200' : 'bg-white border-blue-100'
    }`}>
      <p className={`text-base font-bold ${normal === false ? 'text-red-600' : 'text-gray-800'}`}>
        {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
};

const PatientCard = ({ patient }) => {
  const [expanded, setExpanded]   = useState(false);
  const [metrics, setMetrics]     = useState(null);
  const [loadingMx, setLoadingMx] = useState(false);

  const loadMetrics = async () => {
    if (metrics !== null) { setExpanded(v => !v); return; }
    setExpanded(true);
    setLoadingMx(true);
    try {
      // GET /api/health-metrics/{patientId}
      const data = await getPatientHealthMetrics(patient.patientId);
      setMetrics(Array.isArray(data) ? data : []);
    } catch { setMetrics([]); }
    finally { setLoadingMx(false); }
  };

  const latest = metrics?.[0];

  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-sky-50/90 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <UserIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">{patient.name}</p>
            <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
              {patient.phone && <span>{patient.phone}</span>}
              <span>🗓 {patient.appointmentCount} lần khám</span>
              <span>Lần cuối: {fmtDate(patient.lastVisit)}</span>
            </div>
          </div>
        </div>
        <button onClick={loadMetrics}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition shrink-0">
          <HeartIcon className="h-3.5 w-3.5" />
          {expanded ? <ChevronUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />}
          Chỉ số
        </button>
      </div>

      {expanded && (
        <div className="border-t border-blue-100 bg-blue-50/70 px-4 py-4">
          {loadingMx && (
            <div className="flex justify-center py-4">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
            </div>
          )}
          {!loadingMx && (!metrics || metrics.length === 0) && (
            <p className="text-sm text-gray-400 text-center py-3">Chưa có chỉ số sức khỏe nào</p>
          )}
          {!loadingMx && latest && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 font-medium">Chỉ số mới nhất — {fmtDateTime(latest.measuredAt)}</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                <MetricBadge label="Tâm thu" value={latest.systolicBp}  unit="mmHg"
                  normal={latest.systolicBp ? latest.systolicBp <= 140 : null} />
                <MetricBadge label="Tâm trương" value={latest.diastolicBp} unit="mmHg"
                  normal={latest.diastolicBp ? latest.diastolicBp <= 90 : null} />
                <MetricBadge label="Nhịp tim" value={latest.heartRate} unit="bpm"
                  normal={latest.heartRate ? (latest.heartRate >= 60 && latest.heartRate <= 100) : null} />
                <MetricBadge label="SpO2" value={latest.spO2} unit="%"
                  normal={latest.spO2 ? latest.spO2 >= 95 : null} />
                <MetricBadge label="Nhiệt độ" value={latest.temperature} unit="°C"
                  normal={latest.temperature ? (latest.temperature >= 36 && latest.temperature <= 37.5) : null} />
                <MetricBadge label="Cân nặng" value={latest.weight} unit="kg" />
                <MetricBadge label="Đường huyết" value={latest.bloodGlucose} unit="mmol/L"
                  normal={latest.bloodGlucose ? latest.bloodGlucose <= 7.8 : null} />
                {latest.bmi && <MetricBadge label="BMI" value={latest.bmi?.toFixed(1)} unit=""
                  normal={latest.bmi ? (latest.bmi >= 18.5 && latest.bmi <= 25) : null} />}
              </div>
              {latest.notes && (
                <p className="rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs text-gray-500">
                  {latest.notes}
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
const DoctorPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  const user = getStoredUser();
  const doctorId = user?.doctorId ?? user?.userId;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Lấy tất cả lịch hẹn của bác sĩ → deduplicate theo patientId
        const appts = await getDoctorAppointments(doctorId);
        const map = {};
        (Array.isArray(appts) ? appts : []).forEach(a => {
          if (!map[a.patientId]) {
            map[a.patientId] = {
              patientId:        a.patientId,
              name:             a.patientName,
              phone:            a.patientPhone,
              appointmentCount: 1,
              lastVisit:        a.appointmentDate,
            };
          } else {
            map[a.patientId].appointmentCount++;
            if (new Date(a.appointmentDate) > new Date(map[a.patientId].lastVisit))
              map[a.patientId].lastVisit = a.appointmentDate;
          }
        });
        setPatients(Object.values(map).sort((a,b) => new Date(b.lastVisit) - new Date(a.lastVisit)));
      } catch { /* silent */ }
      finally { setLoading(false); }
    };
    if (doctorId) load();
  }, [doctorId]);

  const filtered = useMemo(() =>
    patients.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase())),
  [patients, search]);

  return (
    <DoctorLayout>
      <div className="space-y-5 max-w-3xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Bệnh nhân của tôi</h2>
          <p className="text-sm text-gray-400 mt-0.5">Danh sách bệnh nhân đã và đang điều trị</p>
        </div>

        {!loading && (
          <div className="bg-blue-50 rounded-xl border border-blue-100 px-4 py-3 inline-flex items-center gap-3">
            <span className="text-2xl font-bold text-blue-700">{patients.length}</span>
            <span className="text-sm text-blue-600">bệnh nhân đã khám</span>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input type="text" placeholder="Tìm bệnh nhân..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {loading && <div className="flex justify-center py-16"><ArrowPathIcon className="h-7 w-7 animate-spin text-blue-500" /></div>}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-3 text-gray-400">
            <UserIcon className="h-14 w-14 text-gray-200" />
            <p className="text-base font-medium text-gray-500">
              {patients.length === 0 ? 'Chưa có bệnh nhân nào' : 'Không tìm thấy bệnh nhân'}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(p => <PatientCard key={p.patientId} patient={p} />)}
        </div>
      </div>
    </DoctorLayout>
  );
};

export default DoctorPatientsPage;

