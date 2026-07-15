import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = (userData) => {
  return apiClient.post('/auth/register', userData);
};

export const loginUser = (credentials) => {
  return apiClient.post('/auth/login', credentials);
};

/** Map AuthResponse từ backend thành object lưu localStorage */
export function mapAuthResponse(data) {
  return {
    userId: data.userId,
    patientId: data.patientId,
    doctorId: data.doctorId,
    email: data.email,
    role: data.role,
    name: data.email,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenType: data.tokenType || 'Bearer',
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
}

export const getClinicalServices = () =>
  apiClient.get('/catalog/services').then((r) => r.data.data);

export const getExamServices = getClinicalServices;

export const getTimeSlots = (doctorId, date) =>
  apiClient.get('/catalog/time-slots', { params: { doctorId, date } }).then((r) => r.data.data);

export const getMyHealthProfile = () =>
  apiClient.get('/health-profile/me').then((r) => r.data.data);

export const updateMyHealthProfile = (payload) =>
  apiClient.put('/health-profile/me', payload).then((r) => r.data.data);

export const bookAppointment = (payload) =>
  apiClient.post('/appointments', payload).then((r) => r.data);

// ─── Appointment History ───────────────────────────────────────────────────────
//Lấy lịch sử đặt khám của bệnh nhân theo patientId.
export const getAppointmentHistory = (patientId, { status, fromDate, toDate } = {}) => {
  const params = {};
  if (status) params.status = status;
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;
  return apiClient
    .get(`/appointments/history/patient/${patientId}`, { params })
    .then((r) => r.data); // BE trả List<AppointmentHistoryResponse> trực tiếp
};

/**
 * Hủy lịch khám.
 * BE endpoint: DELETE /api/appointments/{id}
 * Response: ApiResponse<String> { success, message, data }
 */
export const cancelAppointment = (appointmentId) =>
  apiClient.delete(`/appointments/${appointmentId}`).then((r) => r.data);

export default apiClient;

export const getMyFollowUpReminders = (daysAhead = 14) =>
  apiClient
    .get('/reminders/follow-up/me', { params: { daysAhead } })
    .then((r) => r.data?.data || []);


export const getActiveReminders = (patientId) =>
  apiClient.get(`/reminders/medication/${patientId}`).then((r) => r.data);
 
export const createReminder = (patientId, payload) =>
  apiClient.post('/reminders/medication', payload, { params: { patientId } }).then((r) => r.data);

export const toggleReminder = (id, active) =>
  apiClient.patch(`/reminders/medication/${id}/toggle`, null, { params: { active } }).then((r) => r.data);

export const deleteReminder = (id) =>
  apiClient.delete(`/reminders/medication/${id}`);

export const getMyInvoices = () =>
  apiClient.get('/invoices/me').then((r) => r.data.data);
 

export const getInvoiceById = (id) =>
  apiClient.get(`/invoices/${id}`).then((r) => r.data.data);
 
export const payInvoice = (id, payload) =>
  apiClient.post(`/invoices/${id}/pay`, payload).then((r) => r.data.data);

export const getRevenue = (period) => {
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;
  const date  = now.toISOString().slice(0, 10);

  const map = {
    day:   () => apiClient.get('/reports/revenue/day',   { params: { date } }),
    week:  () => apiClient.get('/reports/revenue/week',  { params: { date } }),
    month: () => apiClient.get('/reports/revenue/month', { params: { year, month } }),
    year:  () => apiClient.get('/reports/revenue/year',  { params: { year } }),
  };
  return (map[period] || map.month)().then((r) => r.data);
};

export const adminGetAllInvoices = () =>
  apiClient.get('/invoices/all')
    .then((r) => Array.isArray(r.data?.data) ? r.data.data : [])
    .catch((error) => {
      console.error("Lỗi khi lấy danh sách hóa đơn:", error);
      return [];
    });                   


export const getSpecialties = () =>
  apiClient.get('/catalog/specialties').then((r) => r.data.data);

export const getDoctorsBySpecialty = (specialtyId) =>
  apiClient.get('/catalog/doctors', { params: { specialtyId } }).then((r) => r.data.data);


export const getAllAppointments = () =>
  apiClient.get('/appointments/history').then((r) => r.data);

export const updateAppointmentStatus = (id, status) =>
  apiClient.patch(`/appointments/${id}/status`, null, { params: { status } }).then((r) => r.data);

export const adminCreateInvoice = (payload) =>
  apiClient.post('/invoices', payload).then((r) => r.data.data);

export const createStaff = (payload, role = 'DOCTOR') =>
  apiClient.post('/auth/create-staff', payload, { params: { role } }).then((r) => r.data);

export const getAllDoctors = () =>
  apiClient.get('/doctors').then((r) =>
    Array.isArray(r.data) ? r.data : r.data?.data || []
  );
 
// PUT /api/doctors/{id}
export const updateDoctor = (id, payload) =>
  apiClient.put(`/doctors/${id}`, payload).then((r) => r.data?.data || r.data);
 
// PATCH /api/doctors/{id}/status?active=true|false
export const toggleDoctorStatus = (id, active) =>
  apiClient.patch(`/doctors/${id}/status`, null, { params: { active } }).then((r) => r.data);
 
// DELETE /api/doctors/{id}
export const deleteDoctor = (id) =>
  apiClient.delete(`/doctors/${id}`).then((r) => r.data);

// GET /api/appointments/history/doctor/{doctorId}
export const getDoctorAppointments = (doctorId) =>
  apiClient.get(`/appointments/history/doctor/${doctorId}`).then((r) => r.data);
 
// POST /api/prescriptions
export const createPrescription = (payload) =>
  apiClient.post('/prescriptions', payload).then((r) => r.data);
 
// GET /api/health-metrics/{patientId}
export const getPatientHealthMetrics = (patientId) =>
  apiClient.get(`/health-metrics/${patientId}`).then((r) => r.data);

// PATCH /api/invoices/{id}/confirm-cash  → Admin duyệt tiền mặt → PAID
export const confirmCashPayment = (id) =>
  apiClient.patch(`/invoices/${id}/confirm-cash`).then((r) => r.data.data);

export const getMyDoctorProfile = () =>
  apiClient.get('/doctors/me').then((r) => r.data.data);

// GET /api/prescriptions/patient/{patientId} → List<PrescriptionResponse>
export const getMyPrescriptions = (patientId) =>
  apiClient.get(`/prescriptions/patient/${patientId}`).then((r) => r.data);
 
// GET /api/service-requests/patient/{patientId} → List<ServiceRequestResponse>
export const getMyServiceRequests = (patientId) =>
  apiClient.get(`/service-requests/patient/${patientId}`).then((r) => r.data);
 
// GET /api/health-metrics/{patientId} → List<HealthMetricResponse>
export const getMyHealthMetrics = (patientId) =>
  apiClient.get(`/health-metrics/${patientId}`).then((r) => r.data);

export const getHealthMetricSummary = (patientId) =>
  apiClient.get(`/health-metrics/${patientId}/summary`).then((r) => r.data);

export const recordHealthMetric = (payload) =>
  apiClient.post('/health-metrics', payload).then((r) => r.data);

export const deleteHealthMetric = (metricId) =>
  apiClient.delete(`/health-metrics/${metricId}`);


// POST /api/medical-records — Tạo bệnh án mới
export const createMedicalRecord = (payload) =>
  apiClient.post('/medical-records', payload).then((r) => r.data.data);
 
// GET /api/medical-records/doctor/{doctorId}
export const getDoctorMedicalRecords = (doctorId) =>
  apiClient.get(`/medical-records/doctor/${doctorId}`).then((r) => r.data.data);
 
// GET /api/medical-records/patient/{patientId}
export const getPatientMedicalRecords = (patientId) =>
  apiClient.get(`/medical-records/patient/${patientId}`).then((r) => r.data.data);
// POST /api/service-requests → Doctor creates one or more clinical service requests
export const createServiceRequests = (payload) =>
  apiClient.post('/service-requests', payload).then((r) => r.data);

// GET /api/service-requests/record/{recordId} → List<ServiceRequestResponse>
export const getServiceRequestsByRecord = (recordId) =>
  apiClient.get(`/service-requests/record/${recordId}`).then((r) => r.data);

// GET /api/service-requests/status/{status} → List<ServiceRequestResponse>
export const getServiceRequestsByStatus = (status) =>
  apiClient.get(`/service-requests/status/${status}`).then((r) => r.data);

// PATCH /api/service-requests/{id}/cancel
export const cancelServiceRequest = (requestId) =>
  apiClient.patch(`/service-requests/${requestId}/cancel`).then((r) => r.data);

// PATCH /api/service-requests/{id}/result -> Doctor/Admin updates clinical result/status
export const updateServiceRequestResult = (requestId, payload) =>
  apiClient.patch(`/service-requests/${requestId}/result`, payload).then((r) => r.data);
// PUT /api/medical-records/{recordId} → Doctor updates diagnosis/treatment/follow-up
export const updateMedicalRecord = (recordId, payload) =>
  apiClient.put(`/medical-records/${recordId}`, payload).then((r) => r.data.data);
// GET /api/admin/users → admin account overview for all roles
export const getAdminUserAccounts = () =>
  apiClient.get('/admin/users').then((r) => r.data.data || []);

// PATCH /api/admin/users/{userId}/status?active=true|false
export const toggleAdminUserStatus = (userId, active) =>
  apiClient.patch(`/admin/users/${userId}/status`, null, { params: { active } }).then((r) => r.data.data);
// GET /api/admin/system-monitor → system monitoring snapshot
export const getSystemMonitorSnapshot = () =>
  apiClient.get('/admin/system-monitor').then((r) => r.data.data);
