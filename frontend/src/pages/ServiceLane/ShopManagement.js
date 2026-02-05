import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BarChart3, TrendingUp, Users, Wrench } from 'lucide-react';

const ShopManagement = () => {
  const [shopMetrics] = useState({
    totalROs: 938,
    inspections: 848,
    inspectionRate: 90.4,
    recommendationsGiven: 373,
    recommendationRate: 44.0,
    recommendationsApproved: 83,
    approvalRate: 22.3,
    avgROValue: 285,
    techUtilization: 87
  });

  const [repairOrders] = useState([
    { id: 'RO-2025-101', bay: 'Bay 1', tech: 'John', vehicle: 'Peterbilt 579', status: 'in_progress', progress: 65, customer: 'ABC Transport' },
    { id: 'RO-2025-102', bay: 'Bay 2', tech: 'Sarah', vehicle: 'Kenworth T680', status: 'waiting', progress: 30, customer: 'XYZ Logistics' },
    { id: 'RO-2025-103', bay: 'Bay 3', tech: 'Mike', vehicle: 'Freightliner', status: 'on_hold', progress: 45, customer: 'Mike\'s Trucking' },
    { id: 'RO-2025-104', bay: 'Bay 4', tech: 'John', vehicle: 'Volvo VNL', status: 'completed', progress: 100, customer: 'ABC Transport' },
    { id: 'RO-2025-105', bay: 'Bay 5', tech: 'Sarah', vehicle: 'Mack Anthem', status: 'in_progress', progress: 80, customer: 'XYZ Logistics' }
  ]);

  const [topServices] = useState([
    { name: 'PM Service', approved: 45, declined: 12, approvalRate: 78.9 },
    { name: 'Brake Pads', approved: 28, declined: 8, approvalRate: 77.8 },
    { name: 'Air Filter', approved: 32, declined: 18, approvalRate: 64.0 },
    { name: 'Tire Rotation', approved: 38, declined: 5, approvalRate: 88.4 },
    { name: 'Battery', approved: 15, declined: 9, approvalRate: 62.5 }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-blue-500';
      case 'waiting': return 'bg-amber-500';
      case 'on_hold': return 'bg-red-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Shop Management Dashboard</h1>
        <p className="text-gray-600 mt-1">Real-time RO tracking and service metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Inspection Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.inspectionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{shopMetrics.inspections} of {shopMetrics.totalROs} ROs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recommendation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.recommendationRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{shopMetrics.recommendationsGiven} recommendations given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.approvalRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{shopMetrics.recommendationsApproved} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tech Utilization</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.techUtilization}%</div>
            <p className="text-xs text-gray-500 mt-1">All technicians</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Bay Status - Live View</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {repairOrders.map((ro) => (
              <div
                key={ro.id}
                className="p-4 border-l-4 rounded-lg hover:shadow-md transition-shadow"
                style={{ borderLeftColor: getStatusColor(ro.status).replace('bg-', '#') }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{ro.id}</h3>
                      <Badge className={`${getStatusColor(ro.status)} text-white`}>
                        {getStatusText(ro.status)}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Bay</p>
                        <p className="font-semibold">{ro.bay}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Technician</p>
                        <p className="font-semibold">{ro.tech}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vehicle</p>
                        <p className="font-semibold">{ro.vehicle}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customer</p>
                        <p className="font-semibold">{ro.customer}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">{ro.progress}%</span>
                  </div>
                  <Progress value={ro.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Approved Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices
                .sort((a, b) => b.approvalRate - a.approvalRate)
                .slice(0, 5)
                .map((service, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-gray-600">{service.approvalRate}% approved</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-green-200 rounded-full h-2" style={{ width: `${service.approvalRate}%` }} />
                      <span className="text-xs text-gray-500">{service.approved} of {service.approved + service.declined}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Declined Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices
                .sort((a, b) => a.approvalRate - b.approvalRate)
                .slice(0, 5)
                .map((service, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-gray-600">{(100 - service.approvalRate).toFixed(1)}% declined</span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-red-200 rounded-full h-2" style={{ width: `${100 - service.approvalRate}%` }} />
                      <span className="text-xs text-gray-500">{service.declined} of {service.approved + service.declined}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Process Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Total Repair Orders</span>
                <span className="font-bold text-blue-600">{shopMetrics.totalROs}</span>
              </div>
              <div className="w-full bg-blue-200 h-8 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Inspections Completed</span>
                <span className="font-bold text-green-600">{shopMetrics.inspections} ({shopMetrics.inspectionRate}%)</span>
              </div>
              <div className="w-[90%] bg-green-200 h-8 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Recommendations Given</span>
                <span className="font-bold text-amber-600">{shopMetrics.recommendationsGiven} ({shopMetrics.recommendationRate}%)</span>
              </div>
              <div className="w-[44%] bg-amber-200 h-8 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Recommendations Approved</span>
                <span className="font-bold text-purple-600">{shopMetrics.recommendationsApproved} ({shopMetrics.approvalRate}%)</span>
              </div>
              <div className="w-[22%] bg-purple-200 h-8 rounded-lg" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2">Insights & Recommendations</h4>
            <ul className="text-sm space-y-1 text-gray-700">
              <li>• Focus on advisor training to increase recommendation rate from 44% to 60%</li>
              <li>• Review pricing on most declined services (Battery, Air Filter)</li>
              <li>• Celebrate high approval rates on PM Service (78.9%) and Tire Rotation (88.4%)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopManagement;
