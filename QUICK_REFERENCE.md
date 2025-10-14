# TruckService Pro - Quick Reference Guide

## 🚀 Quick Start

### Access the Application
```
URL: http://localhost:3000
```

### Demo Login Credentials
```
Admin:          admin@truckservice.com / admin123
Service Mgr:    manager@truckservice.com / manager123
Technician:     tech@truckservice.com / tech123
Fleet Manager:  fleet@company.com / fleet123
Customer:       customer@example.com / customer123
```

---

## 📱 Main Features Overview

### 1. Dashboard
- Revenue: $285,000 | Work Orders: 145 | Repair Time: 4.2 days | Satisfaction: 4.7/5
- Pending approvals and in-progress work orders
- Service revenue breakdown by type

### 2. Work Orders
- Filter by: All, Pending Approval, Scheduled, In Progress, Completed
- Color-coded priorities: Red (High), Blue (Medium), Gray (Low)
- View details, parts, labor, and costs

### 3. Technicians (NEW)
- Real-time status: Working, Available, On Break
- Performance metrics: Hours, Jobs, Efficiency
- Skill matrix with 4 levels: Expert, Advanced, Intermediate, Beginner

### 4. Customers
- Fleet (25-50 vehicles) vs Individual (1-3 vehicles)
- Total spent and member since tracking
- Contact info and fleet size

### 5. Inventory (NEW)
- 6 items tracked | $22,427 total value
- Status: Critical, Low Stock, OK
- Auto-replenish button for low stock items
- Purchase orders: 2 pending ($15,500)

### 6. Payments (NEW)
- Pending: $5,650 | Paid Today: $850
- Payment methods: Credit Card, Cash, Check, Fleet Account
- Click "Process Payment" to simulate payment

### 7. Reports (NEW)
- Today's revenue: $8,450 (Parts: $3,200 | Labor: $5,250)
- Weekly revenue trend chart (7 days)
- Top services: PM ($10,200), Engine ($24,500), Brake ($12,000)

### 8. Fleet Approvals
- Review estimates with parts and labor breakdown
- Approve (green) or Reject (red) buttons
- Real-time status updates

---

## 🎨 Color Coding

### Status Colors
- 🟡 Pending Approval = Amber
- 🔵 Scheduled = Blue
- 🟣 In Progress = Purple
- 🟢 Completed = Green
- 🔴 Critical = Red

### Skill Levels
- 🔴 Expert = Red badge
- 🔵 Advanced = Blue badge
- 🟡 Intermediate = Amber badge
- ⚪ Beginner = Gray badge

---

## 📊 Key Numbers

### Customers
- ABC Transport LLC: 25 vehicles, $125,000 spent
- XYZ Logistics: 50 vehicles, $250,000 spent
- Mike's Trucking: 3 vehicles, $15,000 spent

### Work Orders
- WO-2025-001: Pending | Turbocharger | $4,500
- WO-2025-002: In Progress | PM Service | $850
- WO-2025-003: Completed | Brake Service | $1,150
- WO-2025-004: Scheduled | Tire Rotation | $450

### Technicians
- John: Working on WO-2025-002 | Bay 3 | 95% efficiency
- Sarah: Available | Shop Floor | 92% efficiency
- Mike: On Break | Break Room | 88% efficiency

### Inventory Items
- Turbocharger: 5 of 8 | $2,800 | Low Stock
- Air Filter: 8 of 30 | $60 | Critical
- Oil Filter: 45 of 50 | $22.50 | OK
- Brake Pads: 15 of 25 | $225 | OK

---

## 🔑 Key Features by Role

### Admin / Service Manager
✅ Dashboard, Work Orders, Technicians, Customers
✅ Inventory, Payments, Reports
✅ Full access to all features

### Technician
✅ Dashboard (limited view)
✅ Work Orders (assigned to them)
❌ Management features

### Fleet Manager / Customer
✅ Dashboard (limited view)
✅ Fleet Approvals
❌ Operational features

---

## 💡 Tips & Tricks

### Auto-Replenishment
1. Go to Inventory page
2. Look for items with "Low Stock" or "Critical" badges
3. Click "Auto Replenish" button
4. System creates purchase order automatically
5. Check Purchase Orders panel on right

### Payment Processing
1. Go to Payments page
2. Find pending payment
3. Click "Process Payment" button
4. Choose payment method (4 options)
5. Payment moves to "Recent Payments"

### Technician Assignment
1. Go to Technicians page
2. Scroll to "Skill Matrix" table
3. Find skill required for job
4. Look for technician with "Expert" or "Advanced" level
5. Check if status is "Available"
6. Assign job to that technician

### Approval Workflow
1. Login as Fleet Manager (fleet@company.com)
2. Go to Fleet Approvals
3. Review estimate details
4. Check parts and labor breakdown
5. Click "Approve" (green) or "Reject" (red)

---

## 📁 Important Files

### Mock Data
- `/app/frontend/src/mock/data.js` - Users, customers, trucks, work orders
- `/app/frontend/src/mock/inventoryData.js` - Inventory, payments, technicians, reports

### Pages
- `/app/frontend/src/pages/Dashboard.js`
- `/app/frontend/src/pages/WorkOrders.js`
- `/app/frontend/src/pages/Technicians.js`
- `/app/frontend/src/pages/Customers.js`
- `/app/frontend/src/pages/Inventory.js`
- `/app/frontend/src/pages/Payments.js`
- `/app/frontend/src/pages/Reports.js`
- `/app/frontend/src/pages/FleetApprovals.js`

### Core Files
- `/app/frontend/src/App.js` - Routes
- `/app/frontend/src/components/Layout.js` - Navigation
- `/app/frontend/src/context/AuthContext.js` - Authentication

---

## 🐛 Common Issues

### Issue: Page not loading
**Solution:** Check frontend logs: `tail -f /var/log/supervisor/frontend.out.log`

### Issue: Login not working
**Solution:** Use exact credentials from demo accounts above

### Issue: Data not updating
**Solution:** All data is mocked in localStorage and frontend state

### Issue: Menu items not showing
**Solution:** Different roles see different menu items (role-based access)

---

## 🔄 Data Flow

### Authentication
1. User enters credentials
2. Checked against MOCK_USERS array
3. User object stored in localStorage
4. Context provider updates across app
5. Routes check authentication status

### Work Orders
1. Data loaded from MOCK_WORK_ORDERS
2. Displayed with filters and sorting
3. Status changes update state
4. Visual indicators update automatically

### Inventory
1. Data loaded from MOCK_INVENTORY
2. Auto-replenish calculates: ParLevel - CurrentQty
3. Purchase order created in state
4. UI updates instantly

### Payments
1. Pending payments from MOCK_PAYMENTS
2. Process payment updates status
3. Moves from pending to paid section
4. Totals recalculated

---

## 📞 Next Steps

### For Users
1. Explore all pages with different roles
2. Test work order filters
3. Try auto-replenishment
4. Process mock payments
5. Review technician skill matrix

### For Developers
1. Review PROJECT_DOCUMENTATION.md
2. Explore mock data files
3. Check component structure
4. Plan backend integration
5. Test responsive design

---

## 🎯 Feature Checklist

✅ Multi-role authentication (5 roles)
✅ Dashboard with KPIs (4 metrics)
✅ Work orders management
✅ Fleet approval workflow
✅ Customer/fleet management
✅ Live technician tracking
✅ Skill matrix (6 categories, 4 levels)
✅ Inventory with auto-replenishment
✅ Payment processing (4 methods)
✅ Daily reports & analytics
✅ Red, white, blue color theme
✅ Responsive design
✅ Toast notifications

---

## 📊 Quick Stats

- **Total Pages:** 8
- **User Roles:** 5
- **Mock Customers:** 3
- **Mock Trucks:** 4
- **Mock Work Orders:** 4
- **Mock Technicians:** 3
- **Inventory Items:** 6
- **Payment Methods:** 4
- **Skill Categories:** 6
- **Skill Levels:** 4

---

**Last Updated:** January 14, 2025
**Status:** ✅ Fully Functional with Mock Data
