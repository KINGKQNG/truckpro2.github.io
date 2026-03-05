// ---------------------------------------------------------------------------
// Mock API layer — identical export signatures to api.js
// Used when REACT_APP_BACKEND_URL is not set (e.g. GitHub Pages)
// Every method returns { data: ... } to match the Axios response shape
// ---------------------------------------------------------------------------

import {
  MOCK_USERS,
  MOCK_WORK_ORDERS,
  MOCK_DASHBOARD,
  MOCK_CUSTOMERS,
  MOCK_TRUCKS,
  MOCK_TECHNICIANS,
  MOCK_INVENTORY,
  MOCK_PURCHASE_ORDERS,
  MOCK_PAYMENTS,
  MOCK_APPOINTMENTS,
  MOCK_LEADS,
  MOCK_DAILY_REPORTS,
  MOCK_ADVANCED_REPORTS,
  MOCK_INTEGRATIONS,
  MOCK_OBD_SCAN,
  MOCK_CODE_PAGES
} from './mockData';

// Deep-clone helper — ensures nested arrays/objects are not shared between copies
const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// In-memory mutable copies so mutations persist during the session
let workOrders = deepClone(MOCK_WORK_ORDERS);
let customers = deepClone(MOCK_CUSTOMERS);
let technicians = deepClone(MOCK_TECHNICIANS);
let inventory = deepClone(MOCK_INVENTORY);
let purchaseOrders = deepClone(MOCK_PURCHASE_ORDERS);
let payments = deepClone(MOCK_PAYMENTS);
let appointments = deepClone(MOCK_APPOINTMENTS);
let leads = deepClone(MOCK_LEADS);
let integrations = deepClone(MOCK_INTEGRATIONS);
let codePages = deepClone(MOCK_CODE_PAGES);

// Simulates network latency (200-400 ms)
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// Wraps data in an axios-style response object
const mockResponse = (data) => ({ data });

// ── Auth ─────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: async (email, password) => {
    await delay(400);
    const user = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    if (!user) {
      const err = new Error('Invalid email or password');
      err.response = { data: { detail: 'Invalid email or password' } };
      throw err;
    }
    return mockResponse({
      access_token: `mock-jwt-token-${user.id}-${Date.now()}`,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  }
};

// ── Work Orders ──────────────────────────────────────────────────────────────

export const workOrdersAPI = {
  getAll: async (status = null) => {
    await delay(300);
    const filtered = status
      ? workOrders.filter(wo => wo.status === status)
      : workOrders;
    return mockResponse([...filtered]);
  },

  create: async (data) => {
    await delay(350);
    const newOrder = {
      ...data,
      id: `wo${Date.now()}`,
      workOrderNumber: `WO-2025-${String(workOrders.length + 1).padStart(3, '0')}`,
      createdDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'pending',
      status: 'pending_approval'
    };
    workOrders = [...workOrders, newOrder];
    return mockResponse(newOrder);
  },

  updateStatus: async (id, status) => {
    await delay(250);
    workOrders = workOrders.map(wo =>
      wo.id === id ? { ...wo, status } : wo
    );
    const updated = workOrders.find(wo => wo.id === id);
    return mockResponse(updated);
  },

  updateApproval: async (id, approvalStatus) => {
    await delay(250);
    workOrders = workOrders.map(wo =>
      wo.id === id ? { ...wo, approvalStatus } : wo
    );
    const updated = workOrders.find(wo => wo.id === id);
    return mockResponse(updated);
  },

  approve: async (id) => {
    await delay(250);
    workOrders = workOrders.map(wo =>
      wo.id === id ? { ...wo, approvalStatus: 'approved' } : wo
    );
    const updated = workOrders.find(wo => wo.id === id);
    return mockResponse(updated);
  },

  remove: async (id) => {
    await delay(250);
    workOrders = workOrders.filter(wo => wo.id !== id);
    return mockResponse({ success: true });
  }
};

// ── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardAPI = {
  getSummary: async () => {
    await delay(350);
    return mockResponse({
      kpis: MOCK_DASHBOARD.kpis,
      pendingApprovalOrders: workOrders.filter(wo => wo.approvalStatus === 'pending'),
      inProgressOrders: workOrders.filter(wo => wo.status === 'in_progress')
    });
  }
};

// ── Customers ────────────────────────────────────────────────────────────────

export const customersAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...customers]);
  },

  getDetail: async (id) => {
    await delay(300);
    const customer = customers.find(c => c.id === id);
    const trucks = MOCK_TRUCKS.filter(t => t.customerId === id);
    const customerWorkOrders = workOrders.filter(
      wo => wo.customerName === customer?.name
    );
    return mockResponse({ customer, trucks, workOrders: customerWorkOrders });
  }
};

// ── Trucks ───────────────────────────────────────────────────────────────────

export const trucksAPI = {
  getAll: async (customerId = null) => {
    await delay(250);
    const filtered = customerId
      ? MOCK_TRUCKS.filter(t => t.customerId === customerId)
      : MOCK_TRUCKS;
    return mockResponse([...filtered]);
  }
};

// ── Technicians ──────────────────────────────────────────────────────────────

export const techniciansAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...technicians]);
  },

  updateSkills: async (id, skillLevels) => {
    await delay(300);
    technicians = technicians.map(t =>
      t.id === id ? { ...t, skillLevels: { ...t.skillLevels, ...skillLevels } } : t
    );
    const updated = technicians.find(t => t.id === id);
    return mockResponse(updated);
  }
};

// ── Appointments ─────────────────────────────────────────────────────────────

export const appointmentsAPI = {
  getAll: async (date = null) => {
    await delay(300);
    const filtered = date
      ? appointments.filter(a => a.date === date)
      : appointments;
    return mockResponse([...filtered]);
  },

  create: async (payload) => {
    await delay(350);
    const newAppt = {
      ...payload,
      id: `apt${Date.now()}`,
      status: 'scheduled'
    };
    appointments = [...appointments, newAppt];
    return mockResponse(newAppt);
  }
};

// ── Inspections ──────────────────────────────────────────────────────────────

export const inspectionsAPI = {
  uploadMedia: async (areaId, files) => {
    await delay(400);
    const uploaded = files.map(f => ({
      name: f.name,
      size: f.size,
      timestamp: new Date().toISOString()
    }));
    return mockResponse({ success: true, files: uploaded });
  },

  save: async (payload) => {
    await delay(350);
    return mockResponse({ success: true, id: `insp-${Date.now()}`, ...payload });
  }
};

// ── Inventory ────────────────────────────────────────────────────────────────

export const inventoryAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...inventory]);
  },

  getPurchaseOrders: async () => {
    await delay(300);
    return mockResponse([...purchaseOrders]);
  },

  autoReplenish: async (itemId) => {
    await delay(400);
    const item = inventory.find(i => i.id === itemId);
    if (!item) {
      return mockResponse({ purchaseOrder: null });
    }
    const replenishQty = item.parLevel - item.quantity;
    if (replenishQty <= 0) {
      return mockResponse({ purchaseOrder: null });
    }
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const newPO = {
      id: `po${Date.now()}`,
      orderNumber: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier: 'Auto-Replenish Supplier',
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + SEVEN_DAYS_MS).toISOString().split('T')[0],
      items: [{ partNumber: item.partNumber, name: item.name, quantity: replenishQty, unitCost: item.unitCost, total: replenishQty * item.unitCost }],
      totalAmount: replenishQty * item.unitCost
    };
    purchaseOrders = [...purchaseOrders, newPO];
    inventory = inventory.map(i =>
      i.id === itemId ? { ...i, quantity: item.parLevel, status: 'ok' } : i
    );
    return mockResponse({ purchaseOrder: newPO });
  }
};

// ── Payments ─────────────────────────────────────────────────────────────────

export const paymentsAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...payments]);
  },

  process: async (paymentId, method) => {
    await delay(500);
    payments = payments.map(p =>
      p.id === paymentId
        ? { ...p, status: 'paid', method, paidDate: new Date().toISOString().split('T')[0] }
        : p
    );
    const updated = payments.find(p => p.id === paymentId);
    return mockResponse(updated);
  }
};

// ── Users ────────────────────────────────────────────────────────────────────

export const usersAPI = {
  getAll: async () => {
    await delay(250);
    return mockResponse(
      MOCK_USERS.map(({ id, name, email, role }) => ({ id, name, email, role }))
    );
  },

  updateTiles: async (userId, tiles) => {
    await delay(250);
    return mockResponse({ success: true, userId, tiles });
  }
};

// ── Leads ─────────────────────────────────────────────────────────────────────

export const leadsAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...leads]);
  },

  logInteraction: async (leadId, channel, note = '') => {
    await delay(200);
    leads = leads.map(l =>
      l.id === leadId
        ? {
            ...l,
            lastContact: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            interactions: [
              ...(l.interactions || []),
              { channel, note, timestamp: new Date().toISOString() }
            ]
          }
        : l
    );
    return mockResponse({ success: true });
  }
};

// ── Reports ───────────────────────────────────────────────────────────────────

export const reportsAPI = {
  getDaily: async () => {
    await delay(350);
    return mockResponse(MOCK_DAILY_REPORTS);
  },

  getAdvanced: async () => {
    await delay(400);
    return mockResponse(MOCK_ADVANCED_REPORTS);
  }
};

// ── Integrations ─────────────────────────────────────────────────────────────

export const integrationsAPI = {
  getAll: async () => {
    await delay(300);
    return mockResponse([...integrations]);
  },

  create: async (payload) => {
    await delay(400);
    const newIntegration = {
      ...payload,
      id: `int${Date.now()}`,
      status: 'disconnected',
      lastSync: null,
      isActive: false
    };
    integrations = [...integrations, newIntegration];
    return mockResponse(newIntegration);
  },

  test: async (id) => {
    await delay(800);
    integrations = integrations.map(i =>
      i.id === id ? { ...i, status: 'connected', isActive: true } : i
    );
    return mockResponse({ success: true });
  },

  sync: async (id, syncType) => {
    await delay(600);
    integrations = integrations.map(i =>
      i.id === id ? { ...i, lastSync: new Date().toISOString() } : i
    );
    return mockResponse({ success: true, syncType, recordsProcessed: Math.floor(Math.random() * 200) + 50 });
  }
};

// ── Code Editor ──────────────────────────────────────────────────────────────

export const codeEditorAPI = {
  getPage: async (pageId) => {
    await delay(300);
    const page = codePages[pageId] || codePages['dashboard'];
    return mockResponse(page);
  },

  savePage: async (pageId, payload) => {
    await delay(350);
    codePages = { ...codePages, [pageId]: { ...codePages[pageId], ...payload } };
    return mockResponse({ success: true, pageId });
  }
};

// ── OBD Scanner ───────────────────────────────────────────────────────────────

export const obdAPI = {
  scan: async () => {
    await delay(1200);
    return mockResponse({ ...MOCK_OBD_SCAN });
  },

  createRepairOrder: async (scanData) => {
    await delay(400);
    const newOrder = {
      id: `wo${Date.now()}`,
      workOrderNumber: `WO-2025-${String(workOrders.length + 1).padStart(3, '0')}`,
      customerName: 'OBD Scan Customer',
      truck: `${scanData?.year || ''} ${scanData?.make || ''} ${scanData?.model || ''}`.trim(),
      status: 'pending_approval',
      priority: 'high',
      description: `OBD-II scan repair order. DTCs: ${(scanData?.dtcs || []).map(d => d.code).join(', ')}`,
      scheduledDate: new Date().toISOString().split('T')[0],
      assignedTech: 'Carlos Rodriguez',
      estimatedCost: 0,
      actualCost: 0,
      createdDate: new Date().toISOString().split('T')[0],
      approvalStatus: 'pending',
      parts: [],
      labor: []
    };
    workOrders = [...workOrders, newOrder];
    return mockResponse(newOrder);
  }
};

// ── Diesel Laptops ────────────────────────────────────────────────────────────

export const dieselLaptopsAPI = {
  lookupDTC: async (code, make, model) => {
    await delay(500);
    return mockResponse({
      code,
      make,
      model,
      description: `Diagnostic trouble code ${code} for ${make} ${model}`,
      possibleCauses: ['Sensor failure', 'Wiring issue', 'Component wear'],
      recommendedRepair: 'Inspect and replace affected component per OEM guidelines'
    });
  },

  searchParts: async (search, make) => {
    await delay(400);
    const filtered = MOCK_INVENTORY
      .filter(p => p.name.toLowerCase().includes((search || '').toLowerCase()))
      .slice(0, 10);
    return mockResponse(filtered);
  }
};

export default {};
