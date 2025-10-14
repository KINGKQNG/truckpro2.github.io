export const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@truckservice.com',
    password: 'admin123',
    role: 'admin',
    name: 'Admin User'
  },
  {
    id: '2',
    email: 'manager@truckservice.com',
    password: 'manager123',
    role: 'service_manager',
    name: 'Service Manager'
  },
  {
    id: '3',
    email: 'tech@truckservice.com',
    password: 'tech123',
    role: 'technician',
    name: 'John Technician'
  },
  {
    id: '4',
    email: 'fleet@company.com',
    password: 'fleet123',
    role: 'fleet_manager',
    name: 'Fleet Manager'
  },
  {
    id: '5',
    email: 'customer@example.com',
    password: 'customer123',
    role: 'customer',
    name: 'Customer User'
  }
];

export const MOCK_CUSTOMERS = [
  {
    id: 'c1',
    name: 'ABC Transport LLC',
    type: 'fleet',
    contact: 'John Smith',
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
    name: 'Mike\'s Trucking',
    type: 'individual',
    contact: 'Mike Davis',
    email: 'mike@example.com',
    phone: '555-0103',
    fleetSize: 3,
    status: 'active',
    totalSpent: 15000,
    joinedDate: '2024-01-05'
  }
];

export const MOCK_TRUCKS = [
  {
    id: 't1',
    customerId: 'c1',
    vin: '1XKAD49X0CJ123456',
    year: 2020,
    make: 'Kenworth',
    model: 'T680',
    unitNumber: 'TRK-001',
    mileage: 245000,
    status: 'active'
  },
  {
    id: 't2',
    customerId: 'c1',
    vin: '1XKAD49X0CJ123457',
    year: 2019,
    make: 'Peterbilt',
    model: '579',
    unitNumber: 'TRK-002',
    mileage: 320000,
    status: 'in_service'
  },
  {
    id: 't3',
    customerId: 'c2',
    vin: '1XKAD49X0CJ123458',
    year: 2021,
    make: 'Freightliner',
    model: 'Cascadia',
    unitNumber: 'TRK-105',
    mileage: 180000,
    status: 'active'
  },
  {
    id: 't4',
    customerId: 'c3',
    vin: '1XKAD49X0CJ123459',
    year: 2018,
    make: 'Volvo',
    model: 'VNL 760',
    unitNumber: 'MIKE-01',
    mileage: 450000,
    status: 'active'
  }
];

export const MOCK_WORK_ORDERS = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2025-001',
    customerId: 'c1',
    customerName: 'ABC Transport LLC',
    truckId: 't2',
    truck: 'Peterbilt 579 - TRK-002',
    status: 'pending_approval',
    priority: 'high',
    description: 'Engine warning light, loss of power',
    scheduledDate: '2025-01-15',
    assignedTech: 'John Technician',
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
    customerId: 'c2',
    customerName: 'XYZ Logistics',
    truckId: 't3',
    truck: 'Freightliner Cascadia - TRK-105',
    status: 'in_progress',
    priority: 'medium',
    description: 'Routine maintenance - PM service',
    scheduledDate: '2025-01-12',
    assignedTech: 'John Technician',
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
    customerId: 'c3',
    customerName: 'Mike\'s Trucking',
    truckId: 't4',
    truck: 'Volvo VNL 760 - MIKE-01',
    status: 'completed',
    priority: 'low',
    description: 'Brake inspection and pad replacement',
    scheduledDate: '2025-01-05',
    assignedTech: 'John Technician',
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
    customerId: 'c1',
    customerName: 'ABC Transport LLC',
    truckId: 't1',
    truck: 'Kenworth T680 - TRK-001',
    status: 'scheduled',
    priority: 'medium',
    description: 'Tire rotation and alignment',
    scheduledDate: '2025-01-18',
    assignedTech: 'John Technician',
    estimatedCost: 450,
    actualCost: 0,
    createdDate: '2025-01-10',
    approvalStatus: 'approved',
    parts: [],
    labor: [
      { description: 'Tire rotation', hours: 1.5, rate: 125, cost: 188 },
      { description: 'Wheel alignment', hours: 2, rate: 125, cost: 250 }
    ]
  }
];

export const MOCK_KPI_DATA = {
  totalRevenue: 285000,
  revenueChange: 12.5,
  workOrdersCompleted: 145,
  workOrdersChange: 8.3,
  avgRepairTime: 4.2,
  repairTimeChange: -5.2,
  customerSatisfaction: 4.7,
  satisfactionChange: 3.1,
  activeWorkOrders: 8,
  pendingApprovals: 3,
  scheduledToday: 5,
  monthlyRevenue: [
    { month: 'Jul', revenue: 18500 },
    { month: 'Aug', revenue: 22000 },
    { month: 'Sep', revenue: 21500 },
    { month: 'Oct', revenue: 25000 },
    { month: 'Nov', revenue: 23500 },
    { month: 'Dec', revenue: 28000 },
    { month: 'Jan', revenue: 32000 }
  ],
  serviceTypes: [
    { type: 'Preventive Maintenance', count: 45, revenue: 38250 },
    { type: 'Engine Repair', count: 28, revenue: 126000 },
    { type: 'Brake Service', count: 35, revenue: 42000 },
    { type: 'Tire Service', count: 22, revenue: 18700 },
    { type: 'Electrical', count: 15, revenue: 60050 }
  ]
};

export const MOCK_APPOINTMENTS = [
  {
    id: 'apt1',
    customerId: 'c1',
    customerName: 'ABC Transport LLC',
    truckId: 't1',
    truck: 'Kenworth T680 - TRK-001',
    date: '2025-01-18',
    time: '09:00',
    service: 'Tire rotation and alignment',
    status: 'scheduled',
    technicianId: '3',
    technician: 'John Technician'
  },
  {
    id: 'apt2',
    customerId: 'c2',
    customerName: 'XYZ Logistics',
    truckId: 't3',
    truck: 'Freightliner Cascadia - TRK-105',
    date: '2025-01-19',
    time: '08:00',
    service: 'Diagnostic check',
    status: 'scheduled',
    technicianId: '3',
    technician: 'John Technician'
  }
];
