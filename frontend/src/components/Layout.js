import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { LayoutDashboard, Wrench, Users, CheckSquare, LogOut, Truck, Menu, User, Package, CreditCard, BarChart3, Shield, Plug, Camera, Scan, Calendar, ClipboardList, Target, FileBarChart, FileCode, Cpu } from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const roleLabel = (user?.role || 'user').replace('_', ' ');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'service_manager', 'technician', 'fleet_manager', 'customer'] },
    { path: '/crm/leads', icon: Target, label: 'Lead Management', roles: ['admin', 'service_manager'] },
    { path: '/work-orders', icon: Wrench, label: 'Work Orders', roles: ['admin', 'service_manager', 'technician'] },
    { path: '/service-lane/walk-around', icon: Camera, label: 'Walk-Around', roles: ['admin', 'service_manager', 'technician'] },
    { path: '/service-lane/obd-scanner', icon: Scan, label: 'OBD Scanner', roles: ['admin', 'service_manager', 'technician'] },
    { path: '/service-lane/scheduler', icon: Calendar, label: 'Online Scheduler', roles: ['admin', 'service_manager'] },
    { path: '/service-lane/shop-management', icon: ClipboardList, label: 'Shop Management', roles: ['admin', 'service_manager'] },
    { path: '/technicians', icon: User, label: 'Technicians', roles: ['admin', 'service_manager'] },
    { path: '/customers', icon: Users, label: 'Customers', roles: ['admin', 'service_manager'] },
    { path: '/inventory', icon: Package, label: 'Inventory', roles: ['admin', 'service_manager'] },
    { path: '/payments', icon: CreditCard, label: 'Payments', roles: ['admin', 'service_manager'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['admin', 'service_manager'] },
    { path: '/advanced-reporting', icon: FileBarChart, label: 'SAP Controlling', roles: ['admin', 'service_manager'] },
    { path: '/approvals', icon: CheckSquare, label: 'Fleet Approvals', roles: ['fleet_manager', 'customer'] },
    { path: '/admin-panel', icon: Shield, label: 'Admin Panel', roles: ['admin'] },
    { path: '/admin-code-editor', icon: FileCode, label: 'Code Editor', roles: ['admin'] },
    { path: '/integrations', icon: Plug, label: 'Integrations', roles: ['admin'] },
    { path: '/diesel-laptops', icon: Cpu, label: 'Diesel Laptops', roles: ['admin', 'service_manager', 'technician'] }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="min-h-screen bg-gray-50" data-testid="app-layout">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button data-testid="layout-sidebar-toggle" variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                TruckService Pro
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-gray-600 capitalize">{roleLabel}</p>
            </div>
            <Button data-testid="layout-logout-button" onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r transition-transform duration-300 ease-in-out z-40`}>
          <nav className="p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    data-testid={`layout-nav-${item.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    variant={isActive ? 'default' : 'ghost'}
                    className={`w-full justify-start ${isActive ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white' : ''}`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 lg:ml-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
