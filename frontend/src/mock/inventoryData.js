export const MOCK_INVENTORY = [
  {
    id: 'inv1',
    partNumber: 'TC-2890',
    name: 'Turbocharger',
    category: 'Engine',
    quantity: 5,
    parLevel: 8,
    reorderPoint: 3,
    unitCost: 2800,
    supplier: 'Detroit Parts Co',
    location: 'Warehouse A-12',
    status: 'low_stock'
  },
  {
    id: 'inv2',
    partNumber: 'OF-145',
    name: 'Oil Filter',
    category: 'Filters',
    quantity: 45,
    parLevel: 50,
    reorderPoint: 20,
    unitCost: 22.50,
    supplier: 'Filter Supply Inc',
    location: 'Warehouse B-5',
    status: 'ok'
  },
  {
    id: 'inv3',
    partNumber: 'BP-4500',
    name: 'Brake Pads Set',
    category: 'Brakes',
    quantity: 15,
    parLevel: 25,
    reorderPoint: 10,
    unitCost: 225,
    supplier: 'Brake Masters',
    location: 'Warehouse C-8',
    status: 'ok'
  },
  {
    id: 'inv4',
    partNumber: 'OIL-1540',
    name: 'Oil 15W-40 (Gallon)',
    category: 'Fluids',
    quantity: 120,
    parLevel: 150,
    reorderPoint: 50,
    unitCost: 15,
    supplier: 'Fluid Distributors',
    location: 'Warehouse D-2',
    status: 'ok'
  },
  {
    id: 'inv5',
    partNumber: 'AF-890',
    name: 'Air Filter',
    category: 'Filters',
    quantity: 8,
    parLevel: 30,
    reorderPoint: 12,
    unitCost: 60,
    supplier: 'Filter Supply Inc',
    location: 'Warehouse B-5',
    status: 'critical'
  },
  {
    id: 'inv6',
    partNumber: 'FF-230',
    name: 'Fuel Filter',
    category: 'Filters',
    quantity: 22,
    parLevel: 35,
    reorderPoint: 15,
    unitCost: 80,
    supplier: 'Filter Supply Inc',
    location: 'Warehouse B-5',
    status: 'ok'
  }
];

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
  }
];

export const MOCK_TECHNICIANS = [
  {
    id: 'tech1',
    name: 'John Technician',
    email: 'john@truckservice.com',
    phone: '555-1001',
    status: 'working',
    currentJob: 'WO-2025-002',
    location: 'Bay 3',
    skills: ['Engine Repair', 'Diagnostics', 'Preventive Maintenance', 'Electrical'],
    skillLevels: {
      'Engine Repair': 'expert',
      'Diagnostics': 'expert',
      'Preventive Maintenance': 'advanced',
      'Electrical': 'intermediate',
      'Brake Service': 'advanced',
      'Transmission': 'intermediate'
    },
    certifications: ['ASE Master Technician', 'Cummins Certified'],
    hoursWorked: 38.5,
    jobsCompleted: 12,
    efficiency: 95
  },
  {
    id: 'tech2',
    name: 'Sarah Martinez',
    email: 'sarah@truckservice.com',
    phone: '555-1002',
    status: 'available',
    currentJob: null,
    location: 'Shop Floor',
    skills: ['Brake Service', 'Tire Service', 'Suspension', 'Preventive Maintenance'],
    skillLevels: {
      'Engine Repair': 'intermediate',
      'Diagnostics': 'advanced',
      'Preventive Maintenance': 'expert',
      'Electrical': 'intermediate',
      'Brake Service': 'expert',
      'Transmission': 'beginner'
    },
    certifications: ['ASE Brakes', 'ASE Suspension'],
    hoursWorked: 40,
    jobsCompleted: 15,
    efficiency: 92
  },
  {
    id: 'tech3',
    name: 'Mike Johnson',
    email: 'mikej@truckservice.com',
    phone: '555-1003',
    status: 'on_break',
    currentJob: null,
    location: 'Break Room',
    skills: ['Electrical', 'Diagnostics', 'HVAC'],
    skillLevels: {
      'Engine Repair': 'intermediate',
      'Diagnostics': 'expert',
      'Preventive Maintenance': 'intermediate',
      'Electrical': 'expert',
      'Brake Service': 'intermediate',
      'Transmission': 'advanced'
    },
    certifications: ['ASE Electrical', 'ASE Diagnostics'],
    hoursWorked: 35,
    jobsCompleted: 10,
    efficiency: 88
  }
];

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
  }
];
