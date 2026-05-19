import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach session token if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('tl_session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('tl_session_token');
        sessionStorage.removeItem('tl_session_id');
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── API Helpers ─────────────────────────────────────────────────────────────
export const sessionAPI = {
  init: (data: { applicantName: string; applicantPhone: string; loanAmount: number }) =>
    api.post('/api/v1/sessions/init', data),

  start: (sessionId: string) =>
    api.post(`/api/v1/sessions/${sessionId}/start`),

  get: (sessionId: string) =>
    api.get(`/api/v1/sessions/${sessionId}`),
};

export const consentAPI = {
  capture: (data: {
    sessionId: string;
    consentPhrase: string;
    checkboxChecked: boolean;
  }) => api.post('/api/v1/consent/capture', data),
};
