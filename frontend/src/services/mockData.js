// ---------------------------------------------------------------------------
// Mock data for offline / GitHub Pages mode
// All shapes match exactly what each page component expects from the API
// ---------------------------------------------------------------------------

// ── Auth ────────────────────────────────────────────────────────────────────
export const MOCK_USERS = [
  { id: '1', email: 'admin@truckservice.com', password: 'admin123', role: 'admin', name: 'Mike Johnson' },
  { id: '2', email: 'manager@truckservice.com', password: 'manager123', role: 'service_manager', name: 'Sarah Williams' },
  { id: '3', email: 'tech@truckservice.com', password: 'tech123', role: 'technician', name: 'Carlos Rodriguez' },
  { id: '4', email: 'fleet@company.com', password: 'fleet123', role: 'fleet_customer', name: 'Tom Anderson' }
];

// ── Work Orders ──────────────────────────────────────────────────────────────
// Shape used by WorkOrders.js, Dashboard.js, FleetApprovals.js
export const MOCK_WORK_ORDERS = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2025-001',
    customerName: 'ABC Transport LLC',
    truck: 'Peterbilt 579 - TRK-002',
    status: 'pending_approval',
    priority: 'high',
    description: 'Engine warning light, loss of power. Possible turbocharger failure.',
    scheduledDate: '2025-01-15',
    assignedTech: 'Carlos Rodriguez',
    estimatedCost: 4500,
    actualCost: 0,
    createdDate: '2025-01-10',
    approvalStatus: 'pending',
    parts: [
      { name: 'Turbocharger', partNumber: 'TC-2890', quantity: 1, cost: 2800 },
      { name: 'Oil Filter', partNumber: 'OF-145', quantity: 2, cost: 45 }
    ],
    labor: [
      { description: 'Diagnostic', hours: 2, rate: 125, cost: 250 },
      { description: 'Turbo replacement', hours: 6, rate: 125, cost: 750 }
    ]
  },
  {
    id: 'wo2',
    workOrderNumber: 'WO-2025-002',
    customerName: 'XYZ Logistics',
    truck: 'Freightliner Cascadia - TRK-105',
    status: 'in_progress',
    priority: 'medium',
    description: 'Routine preventive maintenance – PM service package.',
    scheduledDate: '2025-01-12',
    assignedTech: 'Carlos Rodriguez',
    estimatedCost: 850,
    actualCost: 850,
    createdDate: '2025-01-08',
    approvalStatus: 'approved',
    parts: [
      { name: 'Oil 15W-40', partNumber: 'OIL-1540', quantity: 10, cost: 150 },
      { name: 'Air Filter', partNumber: 'AF-890', quantity: 2, cost: 120 },
      { name: 'Fuel Filter', partNumber: 'FF-230', quantity: 1, cost: 80 }
    ],
    labor: [
      { description: 'PM Service', hours: 4, rate: 125, cost: 500 }
    ]
  },
  {
    id: 'wo3',
    workOrderNumber: 'WO-2025-003',
    customerName: "Mike's Trucking",
    truck: 'Volvo VNL 760 - MIKE-01',
    status: 'completed',
    priority: 'low',
    description: 'Brake inspection and pad replacement – front and rear axles.',
    scheduledDate: '2025-01-05',
    assignedTech: 'Sarah Martinez',
    estimatedCost: 1200,
    actualCost: 1150,
    createdDate: '2025-01-03',
    completedDate: '2025-01-06',
    approvalStatus: 'approved',
    paymentStatus: 'pending',
    parts: [
      { name: 'Brake Pads Set', partNumber: 'BP-4500', quantity: 2, cost: 450 }
    ],
    labor: [
      { description: 'Brake service', hours: 5.6, rate: 125, cost: 700 }
    ]
  },
  {
    id: 'wo4',
    workOrderNumber: 'WO-2025-004',
    customerName: 'ABC Transport LLC',
    truck: 'Kenworth T680 - TRK-001',
    status: 'scheduled',
    priority: 'medium',
    description: 'Tire rotation and four-wheel alignment.',
    scheduledDate: '2025-01-18',
    assignedTech: 'Carlos Rodriguez',
    estimatedCost: 450,
    actualCost: 0,
    createdDate: '2025-01-10',
    approvalStatus: 'approved',
    parts: [],
    labor: [
      { description: 'Tire rotation', hours: 1.5, rate: 125, cost: 188 },
      { description: 'Wheel alignment', hours: 2, rate: 125, cost: 250 }
    ]
  },
  {
    id: 'wo5',
    workOrderNumber: 'WO-2025-005',
    customerName: 'Riverside Freight Inc',
    truck: 'Mack Anthem - RF-045',
    status: 'pending_approval',
    priority: 'high',
    description: 'Transmission slipping on gear shifts. Full rebuild required.',
    scheduledDate: '2025-01-20',
    assignedTech: 'Mike Johnson',
    estimatedCost: 7200,
    actualCost: 0,
    createdDate: '2025-01-14',
    approvalStatus: 'pending',
    parts: [
      { name: 'Transmission Rebuild Kit', partNumber: 'TRK-880', quantity: 1, cost: 3500 },
      { name: 'ATF Fluid', partNumber: 'ATF-5', quantity: 8, cost: 240 }
    ],
    labor: [
      { description: 'Transmission removal', hours: 4, rate: 125, cost: 500 },
      { description: 'Rebuild and reinstall', hours: 16, rate: 125, cost: 2000 }
    ]
  },
  {
    id: 'wo6',
    workOrderNumber: 'WO-2025-006',
    customerName: 'Global Carriers Co',
    truck: 'International LT 625 - GC-012',
    status: 'in_progress',
    priority: 'medium',
    description: 'AC system not cooling. Refrigerant leak suspected.',
    scheduledDate: '2025-01-13',
    assignedTech: 'Mike Johnson',
    estimatedCost: 920,
    actualCost: 0,
    createdDate: '2025-01-11',
    approvalStatus: 'approved',
    parts: [
      { name: 'R-134a Refrigerant', partNumber: 'REF-134', quantity: 3, cost: 90 },
      { name: 'AC Compressor', partNumber: 'ACC-770', quantity: 1, cost: 560 }
    ],
    labor: [
      { description: 'AC diagnostics', hours: 1, rate: 125, cost: 125 },
      { description: 'Compressor replacement', hours: 3, rate: 125, cost: 375 }
    ]
  },
  {
    id: 'wo7',
    workOrderNumber: 'WO-2025-007',
    customerName: 'XYZ Logistics',
    truck: 'Kenworth T880 - XYZ-031',
    status: 'completed',
    priority: 'low',
    description: 'Annual DOT inspection and required repairs.',
    scheduledDate: '2025-01-08',
    assignedTech: 'Sarah Martinez',
    estimatedCost: 650,
    actualCost: 680,
    createdDate: '2025-01-06',
    completedDate: '2025-01-09',
    approvalStatus: 'approved',
    paymentStatus: 'paid',
    parts: [
      { name: 'Wiper Blades', partNumber: 'WB-24', quantity: 2, cost: 60 },
      { name: 'Coolant', partNumber: 'COOL-50', quantity: 4, cost: 80 }
    ],
    labor: [
      { description: 'DOT Inspection', hours: 3, rate: 125, cost: 375 },
      { description: 'Minor repairs', hours: 1.5, rate: 125, cost: 188 }
    ]
  },
  {
    id: 'wo8',
    workOrderNumber: 'WO-2025-008',
    customerName: 'Blue Ridge Haulers',
    truck: 'Peterbilt 389 - BRH-007',
    status: 'scheduled',
    priority: 'high',
    description: 'Engine overheating – coolant system flush and thermostat replacement.',
    scheduledDate: '2025-01-22',
    assignedTech: 'Carlos Rodriguez',
    estimatedCost: 1100,
    actualCost: 0,
    createdDate: '2025-01-15',
    approvalStatus: 'approved',
    parts: [
      { name: 'Thermostat', partNumber: 'TH-350', quantity: 1, cost: 85 },
      { name: 'Coolant 50/50', partNumber: 'COOL-50', quantity: 6, cost: 120 }
    ],
    labor: [
      { description: 'Cooling system flush', hours: 2, rate: 125, cost: 250 },
      { description: 'Thermostat replacement', hours: 3, rate: 125, cost: 375 }
    ]
  },
  {
    id: 'wo9',
    workOrderNumber: 'WO-2025-009',
    customerName: 'Riverside Freight Inc',
    truck: 'Freightliner Cascadia 125 - RF-022',
    status: 'in_progress',
    priority: 'medium',
    description: 'Electrical gremlins – intermittent dashboard warning lights.',
    scheduledDate: '2025-01-16',
    assignedTech: 'Mike Johnson',
    estimatedCost: 580,
    actualCost: 0,
    createdDate: '2025-01-14',
    approvalStatus: 'approved',
    parts: [
      { name: 'Fuse Kit', partNumber: 'FK-200', quantity: 1, cost: 35 },
      { name: 'Wiring Harness Tape', partNumber: 'WHT-1', quantity: 2, cost: 20 }
    ],
    labor: [
      { description: 'Electrical diagnosis', hours: 3, rate: 125, cost: 375 },
      { description: 'Wiring repair', hours: 1, rate: 125, cost: 125 }
    ]
  },
  {
    id: 'wo10',
    workOrderNumber: 'WO-2025-010',
    customerName: 'Global Carriers Co',
    truck: 'Volvo VNR 300 - GC-008',
    status: 'completed',
    priority: 'low',
    description: 'Steer axle bearing replacement and kingpin inspection.',
    scheduledDate: '2025-01-07',
    assignedTech: 'Sarah Martinez',
    estimatedCost: 1800,
    actualCost: 1780,
    createdDate: '2025-01-05',
    completedDate: '2025-01-08',
    approvalStatus: 'approved',
    paymentStatus: 'pending',
    parts: [
      { name: 'Wheel Bearing Kit', partNumber: 'WBK-450', quantity: 2, cost: 480 },
      { name: 'Kingpin Kit', partNumber: 'KPK-180', quantity: 1, cost: 320 }
    ],
    labor: [
      { description: 'Bearing removal/install', hours: 5, rate: 125, cost: 625 },
      { description: 'Kingpin inspection', hours: 1.5, rate: 125, cost: 188 }
    ]
  }
];

// ── Dashboard KPIs ───────────────────────────────────────────────────────────
// Shape used by Dashboard.js: response.data.kpis, .pendingApprovalOrders, .inProgressOrders
export const MOCK_DASHBOARD = {
  kpis: {
    totalRevenue: 284750,
    revenueChange: 12.5,
    workOrdersCompleted: 847,
    workOrdersChange: 8.3,
    avgRepairTime: 3.2,
    repairTimeChange: -5.1,
    customerSatisfaction: 4.8,
    satisfactionChange: 2.1,
    serviceTypes: [
      { type: 'Preventive Maintenance', count: 45, revenue: 38250 },
      { type: 'Engine Repair', count: 28, revenue: 126000 },
      { type: 'Brake Service', count: 35, revenue: 42000 },
      { type: 'Tire Service', count: 22, revenue: 18700 },
      { type: 'Electrical', count: 15, revenue: 60050 }
    ]
  },
  pendingApprovalOrders: MOCK_WORK_ORDERS.filter(wo => wo.approvalStatus === 'pending'),
  inProgressOrders: MOCK_WORK_ORDERS.filter(wo => wo.status === 'in_progress')
};

// ── Customers ────────────────────────────────────────────────────────────────
// Shape used by Customers.js list view
export const MOCK_CUSTOMERS = [
  {
    id: 'c1',
    name: 'ABC Transport LLC',
    type: 'fleet',
    contact: 'Tom Anderson',
    email: 'fleet@company.com',
    phone: '555-0101',
    fleetSize: 25,
    status: 'active',
    totalSpent: 125000,
    joinedDate: '2023-01-15'
  },
  {
    id: 'c2',
    name: 'XYZ Logistics',
    type: 'fleet',
    contact: 'Sarah Johnson',
    email: 'sarah@xyzlogistics.com',
    phone: '555-0102',
    fleetSize: 50,
    status: 'active',
    totalSpent: 250000,
    joinedDate: '2022-06-10'
  },
  {
    id: 'c3',
    name: "Mike's Trucking",
    type: 'individual',
    contact: 'Mike Davis',
    email: 'mike@example.com',
    phone: '555-0103',
    fleetSize: 3,
    status: 'active',
    totalSpent: 15000,
    joinedDate: '2024-01-05'
  },
  {
    id: 'c4',
    name: 'Riverside Freight Inc',
    type: 'fleet',
    contact: 'Linda Rivera',
    email: 'linda@riversidefreight.com',
    phone: '555-0104',
    fleetSize: 18,
    status: 'active',
    totalSpent: 87500,
    joinedDate: '2022-11-20'
  },
  {
    id: 'c5',
    name: 'Global Carriers Co',
    type: 'fleet',
    contact: 'James Park',
    email: 'james@globalcarriers.com',
    phone: '555-0105',
    fleetSize: 35,
    status: 'active',
    totalSpent: 195000,
    joinedDate: '2021-08-14'
  },
  {
    id: 'c6',
    name: 'Blue Ridge Haulers',
    type: 'individual',
    contact: 'Billy Harmon',
    email: 'billy@blueridgehaulers.com',
    phone: '555-0106',
    fleetSize: 5,
    status: 'active',
    totalSpent: 22000,
    joinedDate: '2023-07-03'
  }
];

// ── Trucks ───────────────────────────────────────────────────────────────────
// Shape used by Customers.js detail view (trucks per customer)
export const MOCK_TRUCKS = [
  { id: 't1', customerId: 'c1', year: 2020, make: 'Kenworth', model: 'T680', unitNumber: 'TRK-001', vin: '1XKAD49X0CJ100001', mileage: 245000, status: 'active' },
  { id: 't2', customerId: 'c1', year: 2019, make: 'Peterbilt', model: '579', unitNumber: 'TRK-002', vin: '1XKAD49X0CJ100002', mileage: 320000, status: 'in_service' },
  { id: 't3', customerId: 'c2', year: 2021, make: 'Freightliner', model: 'Cascadia', unitNumber: 'TRK-105', vin: '1XKAD49X0CJ100003', mileage: 180000, status: 'active' },
  { id: 't4', customerId: 'c2', year: 2020, make: 'Kenworth', model: 'T880', unitNumber: 'XYZ-031', vin: '1XKAD49X0CJ100004', mileage: 210000, status: 'active' },
  { id: 't5', customerId: 'c3', year: 2018, make: 'Volvo', model: 'VNL 760', unitNumber: 'MIKE-01', vin: '1XKAD49X0CJ100005', mileage: 450000, status: 'active' },
  { id: 't6', customerId: 'c4', year: 2022, make: 'Mack', model: 'Anthem', unitNumber: 'RF-045', vin: '1XKAD49X0CJ100006', mileage: 95000, status: 'active' },
  { id: 't7', customerId: 'c4', year: 2019, make: 'Freightliner', model: 'Cascadia 125', unitNumber: 'RF-022', vin: '1XKAD49X0CJ100007', mileage: 380000, status: 'active' },
  { id: 't8', customerId: 'c5', year: 2021, make: 'International', model: 'LT 625', unitNumber: 'GC-012', vin: '1XKAD49X0CJ100008', mileage: 145000, status: 'active' },
  { id: 't9', customerId: 'c5', year: 2020, make: 'Volvo', model: 'VNR 300', unitNumber: 'GC-008', vin: '1XKAD49X0CJ100009', mileage: 195000, status: 'active' },
  { id: 't10', customerId: 'c6', year: 2017, make: 'Peterbilt', model: '389', unitNumber: 'BRH-007', vin: '1XKAD49X0CJ100010', mileage: 510000, status: 'active' }
];

// ── Technicians ──────────────────────────────────────────────────────────────
// Shape used by Technicians.js and OnlineScheduler.js
export const MOCK_TECHNICIANS = [
  {
    id: 'tech1',
    name: 'Carlos Rodriguez',
    email: 'tech@truckservice.com',
    phone: '555-1001',
    status: 'working',
    currentJob: 'WO-2025-002',
    location: 'Bay 3',
    certifications: ['ASE Master Technician', 'Cummins Certified', 'Detroit Diesel'],
    skillLevels: {
      'Engine Repair': 'expert',
      'Diagnostics': 'expert',
      'Preventive Maintenance': 'advanced',
      'Electrical': 'intermediate',
      'Brake Service': 'advanced',
      'Transmission': 'intermediate'
    },
    hoursWorked: 38.5,
    jobsCompleted: 142,
    efficiency: 95
  },
  {
    id: 'tech2',
    name: 'Sarah Martinez',
    email: 'sarah.martinez@truckservice.com',
    phone: '555-1002',
    status: 'available',
    currentJob: null,
    location: 'Shop Floor',
    certifications: ['ASE Brakes Specialist', 'ASE Suspension', 'Volvo Certified'],
    skillLevels: {
      'Engine Repair': 'intermediate',
      'Diagnostics': 'advanced',
      'Preventive Maintenance': 'expert',
      'Electrical': 'intermediate',
      'Brake Service': 'expert',
      'Transmission': 'beginner'
    },
    hoursWorked: 40,
    jobsCompleted: 158,
    efficiency: 92
  },
  {
    id: 'tech3',
    name: 'Mike Johnson',
    email: 'mike.j@truckservice.com',
    phone: '555-1003',
    status: 'on_break',
    currentJob: null,
    location: 'Break Room',
    certifications: ['ASE Electrical Systems', 'ASE Diagnostics', 'Freightliner Certified'],
    skillLevels: {
      'Engine Repair': 'intermediate',
      'Diagnostics': 'expert',
      'Preventive Maintenance': 'intermediate',
      'Electrical': 'expert',
      'Brake Service': 'intermediate',
      'Transmission': 'advanced'
    },
    hoursWorked: 35,
    jobsCompleted: 98,
    efficiency: 88
  },
  {
    id: 'tech4',
    name: 'David Kim',
    email: 'david.kim@truckservice.com',
    phone: '555-1004',
    status: 'available',
    currentJob: null,
    location: 'Bay 1',
    certifications: ['ASE Master Technician', 'Peterbilt Certified'],
    skillLevels: {
      'Engine Repair': 'advanced',
      'Diagnostics': 'advanced',
      'Preventive Maintenance': 'expert',
      'Electrical': 'advanced',
      'Brake Service': 'advanced',
      'Transmission': 'expert'
    },
    hoursWorked: 42,
    jobsCompleted: 87,
    efficiency: 91
  },
  {
    id: 'tech5',
    name: 'Lisa Chen',
    email: 'lisa.chen@truckservice.com',
    phone: '555-1005',
    status: 'working',
    currentJob: 'WO-2025-009',
    location: 'Bay 5',
    certifications: ['ASE Electrical Systems', 'Kenworth Certified'],
    skillLevels: {
      'Engine Repair': 'beginner',
      'Diagnostics': 'advanced',
      'Preventive Maintenance': 'intermediate',
      'Electrical': 'expert',
      'Brake Service': 'intermediate',
      'Transmission': 'beginner'
    },
    hoursWorked: 37,
    jobsCompleted: 45,
    efficiency: 85
  }
];

// ── Inventory ────────────────────────────────────────────────────────────────
// Shape used by Inventory.js
export const MOCK_INVENTORY = [
  { id: 'inv1', partNumber: 'TC-2890', name: 'Turbocharger', category: 'Engine', quantity: 5, parLevel: 8, unitCost: 2800, status: 'low_stock', location: 'Warehouse A-12' },
  { id: 'inv2', partNumber: 'OF-145', name: 'Oil Filter', category: 'Filters', quantity: 45, parLevel: 50, unitCost: 22.50, status: 'ok', location: 'Warehouse B-5' },
  { id: 'inv3', partNumber: 'BP-4500', name: 'Brake Pads Set', category: 'Brakes', quantity: 15, parLevel: 25, unitCost: 225, status: 'ok', location: 'Warehouse C-8' },
  { id: 'inv4', partNumber: 'OIL-1540', name: 'Oil 15W-40 (Gallon)', category: 'Fluids', quantity: 120, parLevel: 150, unitCost: 15, status: 'ok', location: 'Warehouse D-2' },
  { id: 'inv5', partNumber: 'AF-890', name: 'Air Filter', category: 'Filters', quantity: 8, parLevel: 30, unitCost: 60, status: 'critical', location: 'Warehouse B-5' },
  { id: 'inv6', partNumber: 'FF-230', name: 'Fuel Filter', category: 'Filters', quantity: 22, parLevel: 35, unitCost: 80, status: 'ok', location: 'Warehouse B-5' },
  { id: 'inv7', partNumber: 'TRK-880', name: 'Transmission Rebuild Kit', category: 'Transmission', quantity: 2, parLevel: 5, unitCost: 3500, status: 'low_stock', location: 'Warehouse A-8' },
  { id: 'inv8', partNumber: 'WBK-450', name: 'Wheel Bearing Kit', category: 'Axles', quantity: 12, parLevel: 20, unitCost: 240, status: 'ok', location: 'Warehouse C-3' },
  { id: 'inv9', partNumber: 'REF-134', name: 'R-134a Refrigerant (lb)', category: 'HVAC', quantity: 18, parLevel: 24, unitCost: 30, status: 'ok', location: 'Warehouse D-7' },
  { id: 'inv10', partNumber: 'ACC-770', name: 'AC Compressor', category: 'HVAC', quantity: 3, parLevel: 6, unitCost: 560, status: 'low_stock', location: 'Warehouse A-15' },
  { id: 'inv11', partNumber: 'KPK-180', name: 'Kingpin Kit', category: 'Steering', quantity: 7, parLevel: 10, unitCost: 320, status: 'ok', location: 'Warehouse C-6' },
  { id: 'inv12', partNumber: 'TH-350', name: 'Thermostat', category: 'Cooling', quantity: 14, parLevel: 20, unitCost: 85, status: 'ok', location: 'Warehouse B-11' },
  { id: 'inv13', partNumber: 'COOL-50', name: 'Coolant 50/50 (Gallon)', category: 'Fluids', quantity: 45, parLevel: 60, unitCost: 20, status: 'ok', location: 'Warehouse D-4' },
  { id: 'inv14', partNumber: 'ATF-5', name: 'Automatic Transmission Fluid', category: 'Fluids', quantity: 24, parLevel: 40, unitCost: 30, status: 'ok', location: 'Warehouse D-3' },
  { id: 'inv15', partNumber: 'FK-200', name: 'Fuse Kit Assortment', category: 'Electrical', quantity: 25, parLevel: 30, unitCost: 35, status: 'ok', location: 'Warehouse E-1' },
  { id: 'inv16', partNumber: 'WB-24', name: 'Wiper Blades (pair)', category: 'Cab', quantity: 4, parLevel: 12, unitCost: 30, status: 'critical', location: 'Warehouse E-2' }
];

// ── Purchase Orders ──────────────────────────────────────────────────────────
export const MOCK_PURCHASE_ORDERS = [
  {
    id: 'po1',
    orderNumber: 'PO-2025-001',
    supplier: 'Filter Supply Inc',
    status: 'pending',
    orderDate: '2025-01-12',
    expectedDelivery: '2025-01-18',
    items: [
      { partNumber: 'AF-890', name: 'Air Filter', quantity: 25, unitCost: 60, total: 1500 }
    ],
    totalAmount: 1500
  },
  {
    id: 'po2',
    orderNumber: 'PO-2025-002',
    supplier: 'Detroit Parts Co',
    status: 'pending',
    orderDate: '2025-01-13',
    expectedDelivery: '2025-01-20',
    items: [
      { partNumber: 'TC-2890', name: 'Turbocharger', quantity: 5, unitCost: 2800, total: 14000 }
    ],
    totalAmount: 14000
  },
  {
    id: 'po3',
    orderNumber: 'PO-2025-003',
    supplier: 'Truck Parts Warehouse',
    status: 'ordered',
    orderDate: '2025-01-10',
    expectedDelivery: '2025-01-16',
    items: [
      { partNumber: 'TRK-880', name: 'Transmission Rebuild Kit', quantity: 3, unitCost: 3500, total: 10500 },
      { partNumber: 'ATF-5', name: 'ATF Fluid', quantity: 24, unitCost: 30, total: 720 }
    ],
    totalAmount: 11220
  }
];

// ── Payments ─────────────────────────────────────────────────────────────────
// Shape used by Payments.js
export const MOCK_PAYMENTS = [
  {
    id: 'pay1',
    workOrderId: 'wo3',
    workOrderNumber: 'WO-2025-003',
    customerId: 'c3',
    customerName: "Mike's Trucking",
    amount: 1150,
    status: 'pending',
    method: null,
    date: '2025-01-06',
    dueDate: '2025-01-21'
  },
  {
    id: 'pay2',
    workOrderId: 'wo2',
    workOrderNumber: 'WO-2025-002',
    customerId: 'c2',
    customerName: 'XYZ Logistics',
    amount: 850,
    status: 'paid',
    method: 'credit_card',
    date: '2025-01-12',
    paidDate: '2025-01-12'
  },
  {
    id: 'pay3',
    workOrderId: 'wo1',
    workOrderNumber: 'WO-2025-001',
    customerId: 'c1',
    customerName: 'ABC Transport LLC',
    amount: 4500,
    status: 'pending',
    method: null,
    date: '2025-01-10',
    dueDate: '2025-01-25'
  },
  {
    id: 'pay4',
    workOrderId: 'wo7',
    workOrderNumber: 'WO-2025-007',
    customerId: 'c2',
    customerName: 'XYZ Logistics',
    amount: 680,
    status: 'paid',
    method: 'fleet_account',
    date: '2025-01-09',
    paidDate: '2025-01-09'
  },
  {
    id: 'pay5',
    workOrderId: 'wo10',
    workOrderNumber: 'WO-2025-010',
    customerId: 'c5',
    customerName: 'Global Carriers Co',
    amount: 1780,
    status: 'pending',
    method: null,
    date: '2025-01-08',
    dueDate: '2025-01-23'
  }
];

// ── Appointments ─────────────────────────────────────────────────────────────
// Shape used by OnlineScheduler.js
export const MOCK_APPOINTMENTS = [
  {
    id: 'apt1',
    customerId: 'c1',
    customerName: 'ABC Transport LLC',
    truck: 'Kenworth T680 - TRK-001',
    date: '2025-01-18',
    time: '09:00 AM',
    service: 'Tire rotation and alignment',
    serviceId: 'tire_rotation',
    status: 'scheduled',
    technicianId: 'tech1',
    technician: 'Carlos Rodriguez',
    bay: 'Bay 2'
  },
  {
    id: 'apt2',
    customerId: 'c2',
    customerName: 'XYZ Logistics',
    truck: 'Freightliner Cascadia - TRK-105',
    date: '2025-01-19',
    time: '08:00 AM',
    service: 'Engine diagnostic',
    serviceId: 'engine_diagnostic',
    status: 'scheduled',
    technicianId: 'tech3',
    technician: 'Mike Johnson',
    bay: 'Bay 4'
  },
  {
    id: 'apt3',
    customerId: 'c4',
    customerName: 'Riverside Freight Inc',
    truck: 'Mack Anthem - RF-045',
    date: '2025-01-20',
    time: '10:00 AM',
    service: 'Preventive Maintenance',
    serviceId: 'pm_service',
    status: 'scheduled',
    technicianId: 'tech2',
    technician: 'Sarah Martinez',
    bay: 'Bay 3'
  }
];

// ── Leads ─────────────────────────────────────────────────────────────────────
// Shape used by LeadManagement.js
export const MOCK_LEADS = [
  {
    id: 'L001',
    name: 'Robert Chen',
    company: 'Pacific Coast Freight',
    status: 'hot',
    score: 92,
    vehicle: 'Peterbilt 579 (x3)',
    assigned: 'Sarah Williams',
    lastContact: 'Jan 13, 2025',
    equity: 18500,
    phone: '555-8901',
    email: 'robert@pacificcoastfreight.com',
    source: 'Trade-In Inquiry'
  },
  {
    id: 'L002',
    name: 'Jennifer Walsh',
    company: "Walsh's Hauling",
    status: 'hot',
    score: 87,
    vehicle: 'Kenworth T680',
    assigned: 'Mike Johnson',
    lastContact: 'Jan 12, 2025',
    equity: 9200,
    phone: '555-8902',
    email: 'jennifer@walshshauling.com',
    source: 'Website Form'
  },
  {
    id: 'L003',
    name: 'Derrick Moore',
    company: 'Moore Express LLC',
    status: 'warm',
    score: 68,
    vehicle: 'Freightliner Cascadia',
    assigned: 'Carlos Rodriguez',
    lastContact: 'Jan 10, 2025',
    equity: 5400,
    phone: '555-8903',
    email: 'derrick@mooreexpress.com',
    source: 'Phone Call'
  },
  {
    id: 'L004',
    name: 'Angela Torres',
    company: 'Torres Transport',
    status: 'warm',
    score: 54,
    vehicle: 'Volvo VNL 860',
    assigned: 'Sarah Williams',
    lastContact: 'Jan 08, 2025',
    equity: 3100,
    phone: '555-8904',
    email: 'angela@torrestransport.com',
    source: 'Social Media'
  },
  {
    id: 'L005',
    name: 'Kevin Blake',
    company: 'Blake Brothers Trucking',
    status: 'cold',
    score: 31,
    vehicle: 'Mack Pinnacle',
    assigned: 'Mike Johnson',
    lastContact: 'Dec 28, 2024',
    equity: 0,
    phone: '555-8905',
    email: 'kevin@blakebrothers.com',
    source: 'Walk-In'
  }
];

// ── Reports ───────────────────────────────────────────────────────────────────
// Shape used by Reports.js (response.data.today)
export const MOCK_DAILY_REPORTS = {
  today: {
    date: '2025-01-14',
    revenue: 8450,
    workOrdersCompleted: 6,
    workOrdersInProgress: 3,
    partsRevenue: 3200,
    laborRevenue: 5250,
    avgRepairTime: 4.5,
    technicianUtilization: 87,
    customerCount: 5
  },
  week: [
    { date: '2025-01-08', revenue: 7200, workOrders: 5 },
    { date: '2025-01-09', revenue: 9100, workOrders: 7 },
    { date: '2025-01-10', revenue: 6800, workOrders: 4 },
    { date: '2025-01-11', revenue: 8900, workOrders: 6 },
    { date: '2025-01-12', revenue: 7500, workOrders: 5 },
    { date: '2025-01-13', revenue: 8200, workOrders: 6 },
    { date: '2025-01-14', revenue: 8450, workOrders: 6 }
  ],
  topServices: [
    { service: 'Preventive Maintenance', count: 12, revenue: 10200 },
    { service: 'Engine Repair', count: 8, revenue: 24500 },
    { service: 'Brake Service', count: 10, revenue: 12000 },
    { service: 'Tire Service', count: 6, revenue: 4800 }
  ]
};

// ── Advanced Reports (AdvancedReporting.js) ──────────────────────────────────
export const MOCK_ADVANCED_REPORTS = {
  costCenter: {
    id: 'CC-SERVICE-001',
    actualCosts: 125450,
    planCosts: 118000,
    variance: 7450,
    variancePercent: 6.3
  },
  profitCenter: {
    id: 'PC-TRUCK-SERVICE',
    revenue: 285000,
    costs: 178500,
    profit: 106500,
    marginPercent: 37.4
  },
  inventoryValuation: {
    totalValue: 487250,
    totalQuantity: 2840,
    totalItems: 156,
    byPlant: {
      'Plant 1000': { value: 285000, quantity: 1650, items: 89 },
      'Plant 2000': { value: 202250, quantity: 1190, items: 67 }
    }
  },
  slowMoving: [
    { material: 'FILTER-890', description: 'Air Filter Heavy Duty', quantity: 145, daysSinceMovement: 95, value: 8700, action: 'Discount 20%' },
    { material: 'BELT-456', description: 'Serpentine Belt', quantity: 78, daysSinceMovement: 112, value: 3900, action: 'Transfer to Plant 2000' },
    { material: 'HOSE-234', description: 'Radiator Hose', quantity: 52, daysSinceMovement: 87, value: 1560, action: 'Promotion Bundle' }
  ]
};

// ── Integrations ─────────────────────────────────────────────────────────────
// Shape used by IntegrationsPage.js
export const MOCK_INTEGRATIONS = [
  {
    id: 'int1',
    name: 'SAP Production Server',
    system_type: 'sap',
    status: 'connected',
    endpoint_url: 'https://sap.company.com:8443',
    lastSync: '2025-01-14T08:30:00Z',
    isActive: true
  },
  {
    id: 'int2',
    name: 'Logile Time Tracking',
    system_type: 'logile',
    status: 'connected',
    endpoint_url: 'https://logile.company.com/api',
    lastSync: '2025-01-14T06:00:00Z',
    isActive: true
  },
  {
    id: 'int3',
    name: 'DOS Matrix Parts System',
    system_type: 'dos_matrix',
    status: 'disconnected',
    endpoint_url: '192.168.1.100:5000',
    lastSync: '2025-01-10T14:22:00Z',
    isActive: false
  }
];

// ── OBD Scan ──────────────────────────────────────────────────────────────────
// Shape used by OBDScanner.js
export const MOCK_OBD_SCAN = {
  mileage: 245000,
  engineHours: 8540,
  oilLife: 15,
  batteryVoltage: 12.8,
  vin: '1XKAD49X0CJ100002',
  year: 2019,
  make: 'Peterbilt',
  model: '579',
  tirePressure: {
    frontLeft: 105,
    frontRight: 108,
    rearLeft: 102,
    rearRight: 104
  },
  dtcs: [
    { code: 'P0234', description: 'Turbocharger/Supercharger A Overboost Condition' },
    { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold (Bank 1)' },
    { code: 'P0016', description: 'Crankshaft Position - Camshaft Position Correlation (Bank 1, Sensor A)' }
  ],
  recalls: [
    { id: 'NHTSA-2024-001', description: 'Brake caliper retaining bolt may not be properly torqued' }
  ]
};

// ── Code Editor Pages ─────────────────────────────────────────────────────────
// Shape used by AdminCodeEditor.js
export const MOCK_CODE_PAGES = {
  dashboard: {
    jsCode: `import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const CustomDashboardWidget = () => {
  const [count, setCount] = useState(0);
  return (
    <Card>
      <CardHeader><CardTitle>Custom Widget</CardTitle></CardHeader>
      <CardContent>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>Increment</Button>
      </CardContent>
    </Card>
  );
};

export default CustomDashboardWidget;`,
    cssCode: `.custom-dashboard {
  background: linear-gradient(to right, #dc2626, #2563eb);
  padding: 2rem;
  border-radius: 0.5rem;
}`,
    actionCode: `// Dashboard button action
const handleRefreshData = async () => {
  const response = await fetch('/api/dashboard/summary');
  const data = await response.json();
  setKpis(data.kpis);
};`
  }
};
