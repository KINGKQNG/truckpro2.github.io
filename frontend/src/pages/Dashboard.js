import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { MOCK_KPI_DATA, MOCK_WORK_ORDERS } from '../mock/data';
import { DollarSign, Wrench, Clock, Star, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const Dashboard = () => {
  const { user } = useAuth();
  const kpis = MOCK_KPI_DATA;

  const pendingApprovalOrders = MOCK_WORK_ORDERS.filter(wo => wo.approvalStatus === 'pending');
  const inProgressOrders = MOCK_WORK_ORDERS.filter(wo => wo.status === 'in_progress');

  const KPICard = ({ title, value, change, icon: Icon, prefix = '', suffix = '' }) => {
    const isPositive = change > 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className="p-2 bg-gradient-to-br from-red-50 to-blue-50 rounded-lg">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {prefix}{typeof value === 'number' && value.toLocaleString()}{suffix}
          </div>
          <div className="flex items-center text-xs mt-1">
            <TrendIcon className={`h-3 w-3 mr-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(change)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your service center today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={kpis.totalRevenue}
          change={kpis.revenueChange}
          icon={DollarSign}
          prefix="$"
        />
        <KPICard
          title="Work Orders Completed"
          value={kpis.workOrdersCompleted}
          change={kpis.workOrdersChange}
          icon={Wrench}
        />
        <KPICard
          title="Avg. Repair Time"
          value={kpis.avgRepairTime}
          change={kpis.repairTimeChange}
          icon={Clock}
          suffix=" days"
        />
        <KPICard
          title="Customer Satisfaction"
          value={kpis.customerSatisfaction}
          change={kpis.satisfactionChange}
          icon={Star}
          suffix="/5"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Pending Approvals ({pendingApprovalOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingApprovalOrders.length > 0 ? (
              <div className="space-y-3">
                {pendingApprovalOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{wo.workOrderNumber}</p>
                      <p className="text-xs text-gray-600">{wo.customerName}</p>
                      <p className="text-xs text-gray-500">{wo.truck}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">${wo.estimatedCost.toLocaleString()}</p>
                      <Badge className="bg-amber-500 text-white mt-1">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No pending approvals</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              In Progress ({inProgressOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {inProgressOrders.length > 0 ? (
              <div className="space-y-3">
                {inProgressOrders.map((wo) => (
                  <div key={wo.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{wo.workOrderNumber}</p>
                      <p className="text-xs text-gray-600">{wo.customerName}</p>
                      <p className="text-xs text-gray-500">{wo.assignedTech}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white">In Progress</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No work orders in progress</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Revenue by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {kpis.serviceTypes.map((service, index) => {
              const colors = ['bg-red-500', 'bg-blue-500', 'bg-red-400', 'bg-blue-400', 'bg-gray-500'];
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{service.type}</span>
                    <span className="text-gray-600">${service.revenue.toLocaleString()} ({service.count} orders)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(service.revenue / 126000) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
