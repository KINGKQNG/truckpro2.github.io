import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from './components/ui/toaster';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import WorkOrders from './pages/WorkOrders';
import Customers from './pages/Customers';
import FleetApprovals from './pages/FleetApprovals';
import Inventory from './pages/Inventory';
import Payments from './pages/Payments';
import Reports from './pages/Reports';
import Technicians from './pages/Technicians';
import AdminPanel from './pages/AdminPanel';
import AdminCodeEditor from './pages/AdminCodeEditor';
import IntegrationsPage from './pages/IntegrationsPage';
import DieselLaptops from './pages/DieselLaptops';
import WalkAround from './pages/ServiceLane/WalkAround';
import OBDScanner from './pages/ServiceLane/OBDScanner';
import OnlineScheduler from './pages/ServiceLane/OnlineScheduler';
import ShopManagement from './pages/ServiceLane/ShopManagement';
import LeadManagement from './pages/CRM/LeadManagement';
import AdvancedReporting from './pages/AdvancedReporting';
import Layout from './components/Layout';
import "./App.css";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crm/leads" element={<LeadManagement />} />
            <Route path="/work-orders" element={<WorkOrders />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/approvals" element={<FleetApprovals />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/advanced-reporting" element={<AdvancedReporting />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-code-editor" element={<AdminCodeEditor />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/diesel-laptops" element={<DieselLaptops />} />
            <Route path="/service-lane/walk-around" element={<WalkAround />} />
            <Route path="/service-lane/obd-scanner" element={<OBDScanner />} />
            <Route path="/service-lane/scheduler" element={<OnlineScheduler />} />
            <Route path="/service-lane/shop-management" element={<ShopManagement />} />
          </Route>
        </Routes>
        <Toaster />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
