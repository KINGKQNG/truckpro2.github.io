import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BarChart3, TrendingUp, Users, Wrench, Clock, DollarSign, AlertCircle } from 'lucide-react';

// CDK-style RO status workflow
const RO_STATUSES = [
  { key: 'check_in',      label: 'Check-In',       color: 'bg-sky-500' },
  { key: 'dispatched',    label: 'Dispatched',      color: 'bg-blue-600' },
  { key: 'in_progress',   label: 'In Progress',     color: 'bg-indigo-600' },
  { key: 'waiting',       label: 'Waiting Parts',   color: 'bg-amber-500' },
  { key: 'on_hold',       label: 'On Hold',         color: 'bg-red-500' },
  { key: 'quality_check', label: 'Quality Check',   color: 'bg-purple-600' },
  { key: 'ready',         label: 'Ready',           color: 'bg-green-600' },
  { key: 'delivered',     label: 'Delivered',       color: 'bg-gray-400' }
];

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
    techUtilization: 87,
    effectiveLaborRate: 124.50,    // CDK ELR metric
    hoursPerRO: 1.8,               // CDK hours-per-RO metric
    customerPayGross: 38200,       // CDK CP gross
    warrantyGross: 12450,
    internalGross: 4100
  });

  const [repairOrders, setRepairOrders] = useState([
    {
      id: 'RO-2025-101', bay: 'Bay 1', tech: 'John Martinez', advisor: 'Mike Johnson',
      vehicle: 'Peterbilt 579', status: 'in_progress', progress: 65, customer: 'ABC Transport',
      roType: 'CP', promisedTime: '2:00 PM', openTime: '8:15 AM', laborHrs: 2.5
    },
    {
      id: 'RO-2025-102', bay: 'Bay 2', tech: 'Sarah Kim', advisor: 'Lisa Chen',
      vehicle: 'Kenworth T680', status: 'waiting', progress: 30, customer: 'XYZ Logistics',
      roType: 'WA', promisedTime: '3:30 PM', openTime: '9:00 AM', laborHrs: 1.0
    },
    {
      id: 'RO-2025-103', bay: 'Bay 3', tech: 'Mike Torres', advisor: 'Mike Johnson',
      vehicle: 'Freightliner Cascadia', status: 'on_hold', progress: 45, customer: "Mike's Trucking",
      roType: 'IN', promisedTime: 'EOD', openTime: '7:45 AM', laborHrs: 1.8
    },
    {
      id: 'RO-2025-104', bay: 'Bay 4', tech: 'John Martinez', advisor: 'Lisa Chen',
      vehicle: 'Volvo VNL', status: 'quality_check', progress: 95, customer: 'ABC Transport',
      roType: 'CP', promisedTime: '1:00 PM', openTime: '6:30 AM', laborHrs: 4.2
    },
    {
      id: 'RO-2025-105', bay: 'Bay 5', tech: 'Sarah Kim', advisor: 'Tom Rivera',
      vehicle: 'Mack Anthem', status: 'ready', progress: 100, customer: 'XYZ Logistics',
      roType: 'CP', promisedTime: '12:00 PM', openTime: '7:00 AM', laborHrs: 3.5
    },
    {
      id: 'RO-2025-106', bay: 'Bay 6', tech: 'Dave Wilson', advisor: 'Tom Rivera',
      vehicle: 'International LT', status: 'check_in', progress: 5, customer: 'Lone Star Freight',
      roType: 'CP', promisedTime: '4:00 PM', openTime: '10:30 AM', laborHrs: 0.1
    }
  ]);

  const [topServices] = useState([
    { name: 'PM Service',   approved: 45, declined: 12, approvalRate: 78.9 },
    { name: 'Brake Service', approved: 28, declined: 8, approvalRate: 77.8 },
    { name: 'Air Filter',   approved: 32, declined: 18, approvalRate: 64.0 },
    { name: 'Tire Rotation', approved: 38, declined: 5, approvalRate: 88.4 },
    { name: 'Battery',      approved: 15, declined: 9, approvalRate: 62.5 }
  ]);

  const getRoStatus = (key) => RO_STATUSES.find(s => s.key === key) || RO_STATUSES[0];

  const getRoTypeBadgeClass = (type) => {
    switch (type) {
      case 'CP': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'WA': return 'bg-green-100 text-green-800 border-green-300';
      case 'IN': return 'bg-gray-100 text-gray-700 border-gray-300';
      default:   return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRoTypeLabel = (type) => {
    switch (type) {
      case 'CP': return 'Customer Pay';
      case 'WA': return 'Warranty';
      case 'IN': return 'Internal';
      default:   return type;
    }
  };

  const advanceStatus = (roId) => {
    setRepairOrders(prev => prev.map(ro => {
      if (ro.id !== roId) return ro;
      const idx = RO_STATUSES.findIndex(s => s.key === ro.status);
      const next = RO_STATUSES[Math.min(idx + 1, RO_STATUSES.length - 1)];
      return { ...ro, status: next.key };
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Service Control Board</h1>
        <p className="text-gray-600 mt-1">Live RO tracking — Advisor &amp; technician dispatcher view</p>
      </div>

      {/* KPI Tiles — CDK/eleads fixed-ops metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.approvalRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{shopMetrics.recommendationsApproved} approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Eff. Labor Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${shopMetrics.effectiveLaborRate.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">per flat-rate hour</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hours / RO</CardTitle>
            <Clock className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.hoursPerRO.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">avg labor hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">CP Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(shopMetrics.customerPayGross / 1000).toFixed(1)}k</div>
            <p className="text-xs text-gray-500 mt-1">customer pay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Warranty Gross</CardTitle>
            <Wrench className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(shopMetrics.warrantyGross / 1000).toFixed(1)}k</div>
            <p className="text-xs text-gray-500 mt-1">warranty claims</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Recommendation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopMetrics.recommendationRate}%</div>
            <p className="text-xs text-gray-500 mt-1">{shopMetrics.recommendationsGiven} given</p>
          </CardContent>
        </Card>
      </div>

      {/* Service Control Board — CDK dispatcher / service board style */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-blue-600" />
            Service Bay Status — Live View
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {RO_STATUSES.map(s => (
              <span key={s.key} className="flex items-center gap-1 text-xs text-gray-600">
                <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                {s.label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {repairOrders.map((ro) => {
              const statusDef = getRoStatus(ro.status);
              return (
                <div
                  key={ro.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-base font-bold">{ro.id}</h3>
                        <Badge className={`${statusDef.color} text-white text-xs`}>
                          {statusDef.label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs border ${getRoTypeBadgeClass(ro.roType)}`}>
                          {ro.roType} — {getRoTypeLabel(ro.roType)}
                        </Badge>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-300 text-xs flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Promise: {ro.promisedTime}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-x-4 gap-y-1 text-xs">
                        <div>
                          <p className="text-gray-500">Bay</p>
                          <p className="font-semibold">{ro.bay}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tech</p>
                          <p className="font-semibold">{ro.tech}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Advisor</p>
                          <p className="font-semibold">{ro.advisor}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Vehicle</p>
                          <p className="font-semibold">{ro.vehicle}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Customer</p>
                          <p className="font-semibold">{ro.customer}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Labor Hrs</p>
                          <p className="font-semibold">{ro.laborHrs.toFixed(1)}</p>
                        </div>
                      </div>
                    </div>
                    {ro.status !== 'delivered' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-3 text-xs whitespace-nowrap"
                        onClick={() => advanceStatus(ro.id)}
                      >
                        Advance →
                      </Button>
                    )}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Progress</span>
                      <span className="font-semibold">{ro.progress}%</span>
                    </div>
                    <Progress value={ro.progress} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Approved Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...topServices]
                .sort((a, b) => b.approvalRate - a.approvalRate)
                .slice(0, 5)
                .map((service, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-gray-600">{service.approvalRate}% approved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${service.approvalRate}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{service.approved} / {service.approved + service.declined}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Most Declined Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...topServices]
                .sort((a, b) => a.approvalRate - b.approvalRate)
                .slice(0, 5)
                .map((service, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{service.name}</span>
                      <span className="text-gray-600">{(100 - service.approvalRate).toFixed(1)}% declined</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-red-400 h-2 rounded-full" style={{ width: `${100 - service.approvalRate}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{service.declined} / {service.approved + service.declined}</span>
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
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Total Repair Orders</span>
                <span className="font-bold text-blue-600">{shopMetrics.totalROs}</span>
              </div>
              <div className="w-full bg-blue-200 h-7 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">MPI Inspections Completed</span>
                <span className="font-bold text-green-600">{shopMetrics.inspections} ({shopMetrics.inspectionRate}%)</span>
              </div>
              <div style={{ width: `${shopMetrics.inspectionRate}%` }} className="bg-green-400 h-7 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Recommendations Presented</span>
                <span className="font-bold text-amber-600">{shopMetrics.recommendationsGiven} ({shopMetrics.recommendationRate}%)</span>
              </div>
              <div style={{ width: `${shopMetrics.recommendationRate}%` }} className="bg-amber-400 h-7 rounded-lg" />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-sm">Recommendations Approved</span>
                <span className="font-bold text-purple-600">{shopMetrics.recommendationsApproved} ({shopMetrics.approvalRate}%)</span>
              </div>
              <div style={{ width: `${shopMetrics.approvalRate}%` }} className="bg-purple-400 h-7 rounded-lg" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold mb-2 text-sm">Fixed-Ops Insights</h4>
            <ul className="text-xs space-y-1.5 text-gray-700">
              <li>• ELR of ${shopMetrics.effectiveLaborRate.toFixed(2)}/hr — target ${(shopMetrics.effectiveLaborRate * 1.1).toFixed(2)}/hr (+10%)</li>
              <li>• Focus advisor training to increase recommendation rate from {shopMetrics.recommendationRate}% to 60%</li>
              <li>• Review pricing on most declined services (Battery, Air Filter) to improve approval</li>
              <li>• Celebrate high approval rates on PM Service (78.9%) and Tire Rotation (88.4%)</li>
              <li>• {repairOrders.filter(r => r.roType === 'CP').length} Customer Pay, {repairOrders.filter(r => r.roType === 'WA').length} Warranty, {repairOrders.filter(r => r.roType === 'IN').length} Internal ROs currently open</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopManagement;
