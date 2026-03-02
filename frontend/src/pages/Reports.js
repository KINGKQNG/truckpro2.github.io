import React, { useEffect, useState } from 'react';
import { MOCK_DAILY_REPORTS } from '../mock/inventoryData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { DollarSign, Wrench, TrendingUp, Users } from 'lucide-react';
import { reportsAPI } from '../services/api';

const Reports = () => {
  const [today, setToday] = useState(MOCK_DAILY_REPORTS.today);
  const { week, topServices } = MOCK_DAILY_REPORTS;

  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await reportsAPI.getDaily();
        setToday(response.data.today || MOCK_DAILY_REPORTS.today);
      } catch (error) {
        setToday(MOCK_DAILY_REPORTS.today);
      }
    };

    loadReports();
  }, []);

  return (
    <div className="p-6 space-y-6" data-testid="reports-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Daily Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Track daily performance and sales statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${today.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Parts: ${today.partsRevenue} | Labor: ${today.laborRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today.workOrdersCompleted}</div>
            <p className="text-xs text-gray-500 mt-1">{today.workOrdersInProgress} in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Repair Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today.avgRepairTime} days</div>
            <p className="text-xs text-gray-500 mt-1">Technician Util: {today.technicianUtilization}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customers Served</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{today.customerCount}</div>
            <p className="text-xs text-gray-500 mt-1">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {week.map((day, index) => {
                const maxRevenue = Math.max(...week.map(d => d.revenue));
                const percentage = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <span className="text-gray-600">${day.revenue.toLocaleString()} ({day.workOrders} WOs)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-red-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="font-semibold">Weekly Total</span>
                <span className="font-bold text-blue-600">
                  ${week.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topServices.map((service, index) => {
                const colors = ['from-red-500 to-red-600', 'from-blue-500 to-blue-600', 'from-red-400 to-red-500', 'from-blue-400 to-blue-500'];
                return (
                  <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-semibold">{service.service}</h3>
                      <span className="font-bold text-blue-600">${service.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{service.count} work orders</span>
                      <span>${(service.revenue / service.count).toFixed(0)} avg</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-gradient-to-r ${colors[index]} h-2 rounded-full`}
                        style={{ width: `${(service.count / 12) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Parts Revenue</h3>
              <p className="text-4xl font-bold text-blue-600">${today.partsRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">{((today.partsRevenue / today.revenue) * 100).toFixed(1)}% of total</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Labor Revenue</h3>
              <p className="text-4xl font-bold text-red-600">${today.laborRevenue.toLocaleString()}</p>
              <p className="text-sm text-gray-600 mt-2">{((today.laborRevenue / today.revenue) * 100).toFixed(1)}% of total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
