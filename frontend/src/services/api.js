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
  updateApproval: (id, approvalStatus) => api.put(`/work-orders/${id}/approval`, { approvalStatus }),
  approve: (id) => api.put(`/work-orders/${id}/approve`),
  remove: (id) => api.delete(`/work-orders/${id}`)
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary')
};

export const customersAPI = {
  getAll: () => api.get('/customers'),
  getDetail: (id) => api.get(`/customers/${id}`)
};

export const trucksAPI = {
  getAll: (customerId = null) => api.get('/trucks', { params: customerId ? { customer_id: customerId } : {} })
};

export const techniciansAPI = {
  getAll: () => api.get('/technicians'),
  updateSkills: (id, skillLevels) => api.put(`/technicians/${id}/skills`, { skillLevels })
};

export const appointmentsAPI = {
  getAll: (date = null) => api.get('/appointments', { params: date ? { date } : {} }),
  create: (payload) => api.post('/appointments', payload)
};

export const inspectionsAPI = {
  uploadMedia: (areaId, files) => {
    const formData = new FormData();
    formData.append('areaId', areaId);
    files.forEach((file) => formData.append('files', file));
    return api.post('/inspections/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  save: (payload) => api.post('/inspections', payload)
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getPurchaseOrders: () => api.get('/purchase-orders'),
  autoReplenish: (itemId) => api.post(`/inventory/${itemId}/replenish`)
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  process: (paymentId, method) => api.post(`/payments/${paymentId}/process`, { method })
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  updateTiles: (userId, tiles) => api.put(`/users/${userId}/tiles`, tiles)
};

export const leadsAPI = {
  getAll: () => api.get('/leads'),
  logInteraction: (leadId, channel, note = '') => api.post(`/leads/${leadId}/interactions`, { channel, note })
};

export const reportsAPI = {
  getDaily: () => api.get('/reports/daily'),
  getAdvanced: () => api.get('/reports/advanced')
};

export const integrationsAPI = {
  getAll: () => api.get('/integrations'),
  create: (payload) => api.post('/integrations', payload),
  test: (id) => api.post(`/integrations/${id}/test`),
  sync: (id, syncType) => api.post(`/integrations/${id}/sync`, { syncType })
};

export const codeEditorAPI = {
  getPage: (pageId) => api.get(`/admin/code-editor/${pageId}`),
  savePage: (pageId, payload) => api.put(`/admin/code-editor/${pageId}`, payload)
};

export const obdAPI = {
  scan: () => api.post('/obd/scan'),
  createRepairOrder: (scanData) => api.post('/obd/create-repair-order', { scanData })
};

export const dieselLaptopsAPI = {
  lookupDTC: (code, make, model) => api.get('/diesel-laptops/dtc', { params: { code, make, model } }),
  searchParts: (search, make) => api.get('/diesel-laptops/parts/search', { params: { q: search, make } })
};

export default api;
