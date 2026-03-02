import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.token;
  }
  return null;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password })
};

export const workOrdersAPI = {
  getAll: (status = null) => api.get('/work-orders', { params: status ? { status } : {} }),
  create: (data) => api.post('/work-orders', data),
  updateStatus: (id, status) => api.put(`/work-orders/${id}/status`, { status }),
  approve: (id) => api.put(`/work-orders/${id}/approve`)
};

export const dieselLaptopsAPI = {
  lookupDTC: (code, make, model) => api.get('/diesel-laptops/dtc', { params: { code, make, model } }),
  searchParts: (search, make) => api.get('/diesel-laptops/parts/search', { params: { q: search, make } })
};

export default api;
