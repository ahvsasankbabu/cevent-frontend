import axios from 'axios';

const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      const url = err.config?.url || '';
      const isProfileCheck = url.includes('/college/me') || url.includes('/student/profile');
      if (!isProfileCheck) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────────
export const authAPI = {
  login:          (body) => api.post('/api/v1/auth/login', body),
  register:       (body) => api.post('/api/v1/auth/register', body),
  forgotPassword: (email) => api.post('/api/v1/auth/forgot-password', { email }),
  verifyOtp:      (body) => api.post('/api/v1/auth/verify-otp', body),
  resetPassword:  (body) => api.post('/api/v1/auth/reset-password', body),
};

// ── FESTS ─────────────────────────────────────────────────────────
export const festAPI = {
  getAll:        ()              => api.get('/api/v1/events/fests'),
  getMine:       ()              => api.get('/api/v1/events/my-fests'),
  create:        (body)          => api.post('/api/v1/events/fest', body),
  update:        (festId, body)  => api.put(`/api/v1/events/fest/${festId}`, body),
  activate:      (festId)        => api.put(`/api/v1/events/fest/${festId}/activate`),
  deactivate:    (festId)        => api.put(`/api/v1/events/fest/${festId}/deactivate`),
};

// ── EVENTS ────────────────────────────────────────────────────────
export const eventAPI = {
  getByFest:     (festId)            => api.get(`/api/v1/events/fest/${festId}`),
  getByCategory: (festId, category)  => api.get(`/api/v1/events/fest/${festId}/category/${category}`),
  create:        (festId, body)      => api.post(`/api/v1/events/fest/${festId}/event`, body),
  update:        (eventId, body)     => api.put(`/api/v1/events/${eventId}`, body),
  activate:      (eventId)           => api.put(`/api/v1/events/${eventId}/activate`),
  deactivate:    (eventId)           => api.put(`/api/v1/events/${eventId}/deactivate`),
  slotStatus:    (eventId)           => api.get(`/api/v1/payments/slot-status/${eventId}`),
};

// ── REGISTRATIONS ─────────────────────────────────────────────────
export const regAPI = {
  register:      (eventId)   => api.post(`/api/v1/registrations/event/${eventId}`),
  myReg:         ()          => api.get('/api/v1/registrations/my'),
  cancel:        (regId)     => api.put(`/api/v1/registrations/${regId}/cancel`),
  festSummary:   (festId)    => api.get(`/api/v1/registrations/college/fest/${festId}/summary`),
  participants:  (eventId)   => api.get(`/api/v1/registrations/event/${eventId}/participants`),
  myEventStatus: (eventId)   => api.get(`/api/v1/registrations/event/${eventId}/my-status`),
};

// ── PAYMENTS ──────────────────────────────────────────────────────
export const payAPI = {
  initiate:    (registrationId) => api.post(`/api/v1/payments/initiate/${registrationId}`),
  confirm:     (orderId)        => api.post(`/api/v1/payments/confirm/${orderId}`),
  cancel:      (orderId)        => api.post(`/api/v1/payments/cancel/${orderId}`),
  orderStatus: (orderId)        => api.get(`/api/v1/payments/order/${orderId}/status`),
};

// ── CERTIFICATES ──────────────────────────────────────────────────
export const certAPI = {
  upload:      (formData)         => api.post('/api/v1/certificates/template/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  mapFields:   (templateId, body) => api.post(`/api/v1/certificates/template/${templateId}/mappings`, body),
  generate:    (eventId)          => api.post(`/api/v1/certificates/generate/event/${eventId}`),
  myByReg:     (registrationId)   => api.get(`/api/v1/certificates/my/${registrationId}`),
  myAll:       ()                 => api.get('/api/v1/certificates/my'),
  verify:      (certificateId)    => api.get(`/api/v1/certificates/verify/${certificateId}`),
  status:      (eventId)          => api.get(`/api/v1/certificates/status/event/${eventId}`),
};

// ── SEARCH ────────────────────────────────────────────────────────
export const searchAPI = {
  fests:      (q)    => api.get(`/api/v1/search/fests?query=${q}`),
  events:     (q)    => api.get(`/api/v1/search/events?query=${q}`),
  byCity:     (city) => api.get(`/api/v1/search/fests/city?city=${city}`),
  byCategory: (cat)  => api.get(`/api/v1/search/events/category?category=${cat}`),
};

// ── STUDENT PROFILE ───────────────────────────────────────────────
export const studentAPI = {
  getProfile:    ()     => api.get('/api/v1/student/profile'),
  createProfile: (body) => api.post('/api/v1/student/profile', body),
  updateProfile: (body) => api.put('/api/v1/student/profile', body),
};

// ── COLLEGE ───────────────────────────────────────────────────────
export const collegeAPI = {
  register:       (body) => api.post('/api/v1/college/register', body),
  me:             ()     => api.get('/api/v1/college/me'),
  all:            ()     => api.get('/api/v1/college/all'),
  dashboardStats: ()     => api.get('/api/v1/college/dashboard/stats'),
};

// ── ADMIN ─────────────────────────────────────────────────────────
export const adminAPI = {
  allColleges:     ()   => api.get('/api/v1/admin/colleges'),
  pendingColleges: ()   => api.get('/api/v1/admin/colleges/pending'),
  approve:         (id) => api.put(`/api/v1/admin/colleges/${id}/approve`),
  reject:          (id) => api.put(`/api/v1/admin/colleges/${id}/reject`),
  allUsers:        ()   => api.get('/api/v1/admin/users'),
  stats:           ()   => api.get('/api/v1/admin/stats'),
};