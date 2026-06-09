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

export const getSpecialties = () =>
  apiClient.get('/catalog/specialties').then((r) => r.data.data);

export const getDoctorsBySpecialty = (specialtyId) =>
  apiClient.get('/catalog/doctors', { params: { specialtyId } }).then((r) => r.data.data);

export const getExamServices = () =>
  apiClient.get('/catalog/services').then((r) => r.data.data);

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


export const getActiveReminders = (patientId) =>
  apiClient.get(`/reminders/medication/${patientId}`).then((r) => r.data);
 
export const createReminder = (patientId, payload) =>
  apiClient.post('/reminders/medication', payload, { params: { patientId } }).then((r) => r.data);

export const toggleReminder = (id, active) =>
  apiClient.patch(`/reminders/medication/${id}/toggle`, null, { params: { active } }).then((r) => r.data);

export const deleteReminder = (id) =>
  apiClient.delete(`/reminders/medication/${id}`);
 
export const getMyPrescriptions = (patientId) =>
  apiClient.get(`/prescriptions/patient/${patientId}`).then((r) => r.data);

export const getMyInvoices = () =>
  apiClient.get('/invoices/me').then((r) => r.data.data);
 

export const getInvoiceById = (id) =>
  apiClient.get(`/invoices/${id}`).then((r) => r.data.data);
 
export const payInvoice = (id, payload) =>
  apiClient.post(`/invoices/${id}/pay`, payload).then((r) => r.data.data);