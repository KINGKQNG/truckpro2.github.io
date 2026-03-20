import axios from 'axios';
import * as mockApi from './mockApi';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const USE_MOCK = !BACKEND_URL;

// ── Real axios implementation (used when REACT_APP_BACKEND_URL is set) ────────

const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token;
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
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

const realAuthAPI = {
  login: (email, password) => api.post('/auth/login', { email, password })
};

const realWorkOrdersAPI = {
  getAll: (status = null) => api.get('/work-orders', { params: status ? { status } : {} }),
  create: (data) => api.post('/work-orders', data),
  updateStatus: (id, status) => api.put(`/work-orders/${id}/status`, { status }),
  updateApproval: (id, approvalStatus) => api.put(`/work-orders/${id}/approval`, { approvalStatus }),
  approve: (id) => api.put(`/work-orders/${id}/approve`),
  remove: (id) => api.delete(`/work-orders/${id}`)
};

const realDashboardAPI = {
  getSummary: () => api.get('/dashboard/summary')
};

const realCustomersAPI = {
  getAll: () => api.get('/customers'),
  getDetail: (id) => api.get(`/customers/${id}`)
};

const realTrucksAPI = {
  getAll: (customerId = null) => api.get('/trucks', { params: customerId ? { customer_id: customerId } : {} })
};

const realTechniciansAPI = {
  getAll: () => api.get('/technicians'),
  updateSkills: (id, skillLevels) => api.put(`/technicians/${id}/skills`, { skillLevels })
};

const realAppointmentsAPI = {
  getAll: (date = null) => api.get('/appointments', { params: date ? { date } : {} }),
  create: (payload) => api.post('/appointments', payload)
};

const realInspectionsAPI = {
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

const realInventoryAPI = {
  getAll: () => api.get('/inventory'),
  getPurchaseOrders: () => api.get('/purchase-orders'),
  autoReplenish: (itemId) => api.post(`/inventory/${itemId}/replenish`)
};

const realPaymentsAPI = {
  getAll: () => api.get('/payments'),
  process: (paymentId, method) => api.post(`/payments/${paymentId}/process`, { method })
};

const realUsersAPI = {
  getAll: () => api.get('/users'),
  updateTiles: (userId, tiles) => api.put(`/users/${userId}/tiles`, tiles)
};

const realLeadsAPI = {
  getAll: () => api.get('/leads'),
  logInteraction: (leadId, channel, note = '') => api.post(`/leads/${leadId}/interactions`, { channel, note })
};

const realReportsAPI = {
  getDaily: () => api.get('/reports/daily'),
  getAdvanced: () => api.get('/reports/advanced')
};

const realIntegrationsAPI = {
  getAll: () => api.get('/integrations'),
  create: (payload) => api.post('/integrations', payload),
  test: (id) => api.post(`/integrations/${id}/test`),
  sync: (id, syncType) => api.post(`/integrations/${id}/sync`, { syncType })
};

const realCodeEditorAPI = {
  getPage: (pageId) => api.get(`/admin/code-editor/${pageId}`),
  savePage: (pageId, payload) => api.put(`/admin/code-editor/${pageId}`, payload)
};

const realObdAPI = {
  scan: () => api.post('/obd/scan'),
  createRepairOrder: (scanData) => api.post('/obd/create-repair-order', { scanData })
};

const realDieselLaptopsAPI = {
  lookupDTC: (code, make, model) => api.get('/diesel-laptops/dtc', { params: { code, make, model } }),
  searchParts: (search, make) => api.get('/diesel-laptops/parts/search', { params: { q: search, make } }),
  getWiringDiagram: (vin, system) => api.get('/diesel-laptops/wiring', { params: { vin, system } }),
  getTSBs: (make, model, year) => api.get('/diesel-laptops/tsb', { params: { make, model, year } }),
  getMaintenanceSchedule: (vin, mileage) => api.get('/diesel-laptops/maintenance', { params: { vin, mileage } }),
  fleetScan: () => api.get('/diesel-laptops/fleet-scan'),
};

// ── Conditional exports ───────────────────────────────────────────────────────
// When REACT_APP_BACKEND_URL is not set, all exports use the mock implementation
// so the app works on GitHub Pages without a backend.

export const authAPI = USE_MOCK ? mockApi.authAPI : realAuthAPI;
export const workOrdersAPI = USE_MOCK ? mockApi.workOrdersAPI : realWorkOrdersAPI;
export const dashboardAPI = USE_MOCK ? mockApi.dashboardAPI : realDashboardAPI;
export const customersAPI = USE_MOCK ? mockApi.customersAPI : realCustomersAPI;
export const trucksAPI = USE_MOCK ? mockApi.trucksAPI : realTrucksAPI;
export const techniciansAPI = USE_MOCK ? mockApi.techniciansAPI : realTechniciansAPI;
export const appointmentsAPI = USE_MOCK ? mockApi.appointmentsAPI : realAppointmentsAPI;
export const inspectionsAPI = USE_MOCK ? mockApi.inspectionsAPI : realInspectionsAPI;
export const inventoryAPI = USE_MOCK ? mockApi.inventoryAPI : realInventoryAPI;
export const paymentsAPI = USE_MOCK ? mockApi.paymentsAPI : realPaymentsAPI;
export const usersAPI = USE_MOCK ? mockApi.usersAPI : realUsersAPI;
export const leadsAPI = USE_MOCK ? mockApi.leadsAPI : realLeadsAPI;
export const reportsAPI = USE_MOCK ? mockApi.reportsAPI : realReportsAPI;
export const integrationsAPI = USE_MOCK ? mockApi.integrationsAPI : realIntegrationsAPI;
export const codeEditorAPI = USE_MOCK ? mockApi.codeEditorAPI : realCodeEditorAPI;
export const obdAPI = USE_MOCK ? mockApi.obdAPI : realObdAPI;
export const dieselLaptopsAPI = USE_MOCK ? mockApi.dieselLaptopsAPI : realDieselLaptopsAPI;

export default api;
