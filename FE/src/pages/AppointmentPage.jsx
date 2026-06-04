import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientLayout from '../components/PatientLayout';
import {
  getSpecialties,
  getDoctorsBySpecialty,
  getExamServices,
  getTimeSlots,
  getMyHealthProfile,
  bookAppointment,
} from '../services/api';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const STEPS = [
  { id: 1, label: 'Chọn chuyên khoa & bác sĩ' },
  { id: 2, label: 'Chọn thời gian' },
  { id: 3, label: 'Xác nhận thông tin' },
];

const FALLBACK_SPECIALTIES = [
  { specialtyId: 1, specialtyName: 'Nội khoa', description: 'Khám và điều trị bệnh nội tổng quát' },
  { specialtyId: 2, specialtyName: 'Ngoại khoa', description: 'Phẫu thuật và điều trị ngoại khoa' },
  { specialtyId: 3, specialtyName: 'Nhi khoa', description: 'Chăm sóc sức khỏe trẻ em' },
  { specialtyId: 4, specialtyName: 'Tim mạch', description: 'Khám chuyên khoa tim mạch' },
];

const formatCurrency = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const todayStr = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

const maxDateStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
};

const isSunday = (dateStr) => {
  if (!dateStr) return false;
  return new Date(dateStr + 'T12:00:00').getDay() === 0;
};

const AppointmentPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [profile, setProfile] = useState(null);

  const [specialtyId, setSpecialtyId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('new');
  const [forRelative, setForRelative] = useState(false);
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});

  const selectedSpecialty = specialties.find((s) => String(s.specialtyId) === String(specialtyId));
  const selectedDoctor = doctors.find((d) => String(d.doctorId) === String(doctorId));
  const selectedService = services.find((s) => String(s.serviceId) === String(serviceId));
  const estimatedPrice = selectedService?.basePrice ?? 150000;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [specs, svcs, prof] = await Promise.all([
          getSpecialties().catch(() => []),
          getExamServices().catch(() => []),
          getMyHealthProfile().catch(() => null),
        ]);
        setSpecialties(specs?.length ? specs : FALLBACK_SPECIALTIES);
        setServices(svcs || []);
        setProfile(prof);
      } catch {
        setSpecialties(FALLBACK_SPECIALTIES);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!specialtyId) {
      setDoctors([]);
      setDoctorId('');
      return;
    }
    getDoctorsBySpecialty(specialtyId)
      .then(setDoctors)
      .catch(() => setDoctors([]));
    setDoctorId('');
  }, [specialtyId]);

  useEffect(() => {
    if (!doctorId || !selectedDate || isSunday(selectedDate)) {
      setTimeSlots([]);
      setSelectedTime('');
      return;
    }
    getTimeSlots(doctorId, selectedDate)
      .then(setTimeSlots)
      .catch(() => setTimeSlots([]));
    setSelectedTime('');
  }, [doctorId, selectedDate]);

  const validateStep = (s) => {
    const e = {};
    if (s >= 1) {
      if (!specialtyId) e.specialtyId = 'Vui lòng chọn chuyên khoa.';
      if (!doctorId) e.doctorId = 'Vui lòng chọn bác sĩ.';
    }
    if (s >= 2) {
      if (!selectedDate) e.selectedDate = 'Vui lòng chọn ngày khám.';
      else if (isSunday(selectedDate)) e.selectedDate = 'Phòng khám nghỉ Chủ nhật. Vui lòng chọn ngày khác.';
      else if (selectedDate < todayStr()) e.selectedDate = 'Không thể chọn ngày trong quá khứ.';
      if (!selectedTime) e.selectedTime = 'Vui lòng chọn khung giờ khám.';
    }
    if (s >= 3) {
      if (!profile?.patientId && !forRelative) e.patient = 'Không tìm thấy hồ sơ bệnh nhân. Vui lòng đăng nhập lại.';
      if (!reason.trim()) e.reason = 'Vui lòng mô tả lý do khám.';
      else if (reason.trim().length < 10) e.reason = 'Lý do khám cần ít nhất 10 ký tự.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    setSubmitting(true);
    setApiError('');
    try {
      const appointmentDate = `${selectedDate}T${selectedTime}:00`;
      await bookAppointment({
        patientId: profile.patientId,
        doctorId: Number(doctorId),
        specialtyId: Number(specialtyId),
        appointmentDate,
        reason: reason.trim(),
        followUp: appointmentType === 'followup',
      });
      setSuccess(true);
      setTimeout(() => navigate('/appointment-history'), 2500);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.data ||
        'Không thể đặt lịch. Vui lòng thử lại hoặc chọn khung giờ khác.';
      setApiError(typeof msg === 'string' ? msg : 'Đặt lịch thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = useMemo(
    () => timeSlots.filter((s) => s.available),
    [timeSlots]
  );

  if (loading) {
    return (
      <PatientLayout pageTitle="Đặt lịch khám">
        <div className="p-8 text-center text-gray-600">Đang tải dữ liệu...</div>
      </PatientLayout>
    );
  }

  return (
    <PatientLayout pageTitle="Đặt lịch khám">
      <div className="p-6 max-w-6xl mx-auto">
        {/* Hướng dẫn & lưu ý */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Hướng dẫn đặt lịch</h3>
            <ol className="text-sm text-blue-900 space-y-1 list-decimal list-inside">
              <li>Chọn chuyên khoa và bác sĩ</li>
              <li>Chọn ngày và khung giờ còn trống</li>
              <li>Xác nhận thông tin và gửi yêu cầu đặt lịch</li>
            </ol>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5" /> Lưu ý quan trọng
            </h3>
            <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
              <li>Đến trước giờ hẹn 15–20 phút để làm thủ tục</li>
              <li>Mang CMND/CCCD và thẻ BHYT (nếu có)</li>
              <li>Hủy lịch trước 24h qua mục Lịch sử đặt khám</li>
              <li>Phòng khám nghỉ Chủ nhật</li>
            </ul>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg shadow-sm p-4">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                type="button"
                onClick={() => s.id < step && setStep(s.id)}
                className={`flex flex-col items-center flex-1 ${
                  step >= s.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                    step >= s.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {step > s.id ? '✓' : s.id}
                </span>
                <span className="text-xs mt-2 text-center hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${step > s.id ? 'bg-blue-600' : 'bg-gray-200'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Bước 1: Bộ lọc */}
            {step === 1 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Chọn thông tin khám
                </h2>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên khoa <span className="text-red-500">*</span>
                </label>
                <select
                  value={specialtyId}
                  onChange={(e) => setSpecialtyId(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 mb-1 ${
                    errors.specialtyId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">-- Chọn chuyên khoa --</option>
                  {specialties.map((s) => (
                    <option key={s.specialtyId} value={s.specialtyId}>
                      {s.specialtyName}
                    </option>
                  ))}
                </select>
                {errors.specialtyId && (
                  <p className="text-red-500 text-sm mb-3">{errors.specialtyId}</p>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                  Bác sĩ <span className="text-red-500">*</span>
                </label>
                {!specialtyId ? (
                  <p className="text-gray-500 text-sm">Vui lòng chọn chuyên khoa trước.</p>
                ) : doctors.length === 0 ? (
                  <p className="text-amber-600 text-sm">Chưa có bác sĩ cho chuyên khoa này.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {doctors.map((d) => (
                      <button
                        key={d.doctorId}
                        type="button"
                        onClick={() => setDoctorId(String(d.doctorId))}
                        className={`text-left p-4 rounded-lg border-2 transition-all ${
                          String(doctorId) === String(d.doctorId)
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon className="h-7 w-7 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{d.fullName}</p>
                            <p className="text-xs text-gray-500">
                              {d.specialtyName}
                              {d.roomNumber ? ` · Phòng ${d.roomNumber}` : ''}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.doctorId && (
                  <p className="text-red-500 text-sm mt-2">{errors.doctorId}</p>
                )}

                {services.length > 0 && (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-1 mt-6">
                      Gói khám / Dịch vụ (tùy chọn)
                    </label>
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Khám chuyên khoa tiêu chuẩn</option>
                      {services.map((s) => (
                        <option key={s.serviceId} value={s.serviceId}>
                          {s.serviceName} — {formatCurrency(s.basePrice)}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </section>
            )}

            {/* Bước 2: Thời gian */}
            {step === 2 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Chọn thời gian khám</h2>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày khám <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={todayStr()}
                  max={maxDateStr()}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 mb-1 ${
                    errors.selectedDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.selectedDate && (
                  <p className="text-red-500 text-sm mb-3">{errors.selectedDate}</p>
                )}
                {isSunday(selectedDate) && (
                  <p className="text-amber-600 text-sm mb-3">Chủ nhật — phòng khám nghỉ.</p>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Khung giờ <span className="text-red-500">*</span>
                </label>
                {!doctorId || !selectedDate ? (
                  <p className="text-gray-500 text-sm">Chọn bác sĩ và ngày để xem khung giờ.</p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        className={`py-2 px-2 rounded-lg text-sm font-medium border ${
                          !slot.available
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                            : selectedTime === slot.time
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-800 border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
                {errors.selectedTime && (
                  <p className="text-red-500 text-sm mt-2">{errors.selectedTime}</p>
                )}
                {timeSlots.length > 0 && availableSlots.length === 0 && (
                  <p className="text-amber-600 text-sm mt-2">
                    Không còn khung giờ trống trong ngày này. Vui lòng chọn ngày khác.
                  </p>
                )}
              </section>
            )}

            {/* Bước 3: Bệnh nhân */}
            {step === 3 && (
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Thông tin bệnh nhân</h2>

                <div className="bg-gray-50 rounded-lg p-4 grid sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Họ tên:</span>{' '}
                    <strong>{profile?.fullName || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">SĐT:</span>{' '}
                    <strong>{profile?.phone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{' '}
                    <strong>{profile?.email || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Giới tính:</span>{' '}
                    <strong>{profile?.gender || '—'}</strong>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={forRelative}
                    onChange={(e) => setForRelative(e.target.checked)}
                    className="rounded"
                  />
                  Đặt lịch khám cho người thân (cần mang giấy tờ người thân khi đến khám)
                </label>

                <div>
                  <span className="block text-sm font-medium text-gray-700 mb-2">
                    Loại lịch hẹn
                  </span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="appointmentType"
                        checked={appointmentType === 'new'}
                        onChange={() => setAppointmentType('new')}
                      />
                      Khám mới
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="appointmentType"
                        checked={appointmentType === 'followup'}
                        onChange={() => setAppointmentType('followup')}
                      />
                      Tái khám
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lý do khám <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Mô tả triệu chứng hoặc lý do đến khám (ít nhất 10 ký tự)..."
                    className={`w-full border rounded-lg px-3 py-2 ${
                      errors.reason ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.reason && (
                    <p className="text-red-500 text-sm mt-1">{errors.reason}</p>
                  )}
                </div>
                {errors.patient && (
                  <p className="text-red-500 text-sm">{errors.patient}</p>
                )}
              </section>
            )}

            {/* Điều hướng bước */}
            <div className="flex justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Quay lại
                </button>
              ) : (
                <div />
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Tiếp theo
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || success}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
                >
                  {submitting ? 'Đang đặt lịch...' : 'Đặt lịch khám'}
                </button>
              )}
            </div>
            {apiError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
                {apiError}
              </p>
            )}
            {success && (
              <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5" />
                Đặt lịch thành công! Đang chuyển đến lịch sử đặt khám...
              </p>
            )}
          </div>

          {/* Tóm tắt */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4 border border-blue-100">
              <h3 className="font-bold text-gray-800 mb-4">Tóm tắt đặt lịch</h3>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Chuyên khoa</dt>
                  <dd className="font-medium">{selectedSpecialty?.specialtyName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Bác sĩ</dt>
                  <dd className="font-medium">{selectedDoctor?.fullName || '—'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Dịch vụ</dt>
                  <dd className="font-medium">
                    {selectedService?.serviceName || 'Khám chuyên khoa tiêu chuẩn'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Ngày giờ</dt>
                  <dd className="font-medium">
                    {selectedDate && selectedTime
                      ? `${selectedDate} lúc ${selectedTime}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Loại khám</dt>
                  <dd className="font-medium">
                    {appointmentType === 'followup' ? 'Tái khám' : 'Khám mới'}
                  </dd>
                </div>
                <div className="pt-3 border-t">
                  <dt className="text-gray-500">Chi phí dự kiến</dt>
                  <dd className="text-lg font-bold text-blue-600">
                    {formatCurrency(estimatedPrice)}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </PatientLayout>
  );
};

export default AppointmentPage;
