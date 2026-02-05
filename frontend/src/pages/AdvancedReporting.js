import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Download, RefreshCw, TrendingUp, TrendingDown, DollarSign, Package, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const AdvancedReporting = () => {
  const { toast } = useToast();
  
  const [financialData] = useState({
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
  });

  const [inventoryCounts] = useState([
    { location: 'Warehouse A', scheduled: '2025-01-20', status: 'pending', items: 89, lastCount: '2024-12-15' },
    { location: 'Warehouse B', scheduled: '2025-01-22', status: 'pending', items: 67, lastCount: '2024-12-18' },
    { location: 'Service Bay Storage', scheduled: '2025-01-18', status: 'in_progress', items: 34, lastCount: '2024-12-20' }
  ]);

  const handleSyncSAP = () => {
    toast({
      title: "Syncing with SAP S/4HANA",
      description: "Fetching latest financial and inventory data...",
    });
    
    setTimeout(() => {
      toast({
        title: "Sync Complete",
        description: "Data updated successfully from SAP S/4HANA",
      });
    }, 2000);
  };

  const handleExportReport = (reportType) => {
    toast({
      title: "Exporting Report",
      description: `${reportType} report exported to Excel`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Reporting & Controlling</h1>
          <p className="text-gray-600 mt-1">SAP S/4HANA integrated financial and inventory control</p>
        </div>
        <Button onClick={handleSyncSAP} className="bg-gradient-to-r from-red-600 to-blue-600">
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync with SAP S/4HANA
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cost Center Analysis</CardTitle>
              <Badge variant="outline">{financialData.costCenter.id}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Actual Costs</p>
                <p className="text-2xl font-bold">${financialData.costCenter.actualCosts.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Plan Costs</p>
                <p className="text-2xl font-bold text-blue-600">${financialData.costCenter.planCosts.toLocaleString()}</p>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${financialData.costCenter.variance > 0 ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Variance</span>
                <div className="text-right">
                  <p className={`text-xl font-bold ${financialData.costCenter.variance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(financialData.costCenter.variance).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    {financialData.costCenter.variance > 0 ? (
                      <TrendingUp className="h-4 w-4 text-red-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-green-600" />
                    )}
                    <span>{financialData.costCenter.variancePercent}%</span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => handleExportReport('Cost Center')} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Cost Center Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profit Center Analysis</CardTitle>
              <Badge variant="outline">{financialData.profitCenter.id}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="text-lg font-bold text-green-600">${(financialData.profitCenter.revenue / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Costs</p>
                <p className="text-lg font-bold text-red-600">${(financialData.profitCenter.costs / 1000).toFixed(0)}K</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Profit</p>
                <p className="text-lg font-bold text-blue-600">${(financialData.profitCenter.profit / 1000).toFixed(0)}K</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Profit Margin</span>
                <p className="text-2xl font-bold text-blue-600">{financialData.profitCenter.marginPercent}%</p>
              </div>
            </div>
            <Button onClick={() => handleExportReport('Profit Center')} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Profit Center Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Inventory Valuation (SAP S/4HANA)</CardTitle>
            <div className="flex gap-2">
              <Badge className="bg-blue-600 text-white">
                <Package className="h-3 w-3 mr-1" />
                {financialData.inventoryValuation.totalItems} Items
              </Badge>
              <Badge className="bg-green-600 text-white">
                <DollarSign className="h-3 w-3 mr-1" />
                ${(financialData.inventoryValuation.totalValue / 1000).toFixed(0)}K
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-blue-600">${financialData.inventoryValuation.totalValue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Quantity</p>
                <p className="text-2xl font-bold text-green-600">{financialData.inventoryValuation.totalQuantity.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Avg Value/Item</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${(financialData.inventoryValuation.totalValue / financialData.inventoryValuation.totalItems).toFixed(0)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Valuation by Plant</h4>
              <div className="space-y-3">
                {Object.entries(financialData.inventoryValuation.byPlant).map(([plant, data]) => (
                  <div key={plant} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{plant}</span>
                      <span className="font-bold text-blue-600">${data.value.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <span>Qty: {data.quantity}</span>
                      <span>Items: {data.items}</span>
                      <span>Avg: ${(data.value / data.items).toFixed(0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={() => handleExportReport('Inventory Valuation')} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Export Inventory Valuation Report
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Slow-Moving Inventory Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {financialData.slowMoving.map((item, idx) => (
              <div key={idx} className="p-4 border-l-4 border-l-amber-500 bg-amber-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{item.material}</Badge>
                      <Badge className="bg-amber-500 text-white">{item.daysSinceMovement} days</Badge>
                    </div>
                    <p className="font-semibold">{item.description}</p>
                    <p className="text-sm text-gray-600">On Hand: {item.quantity} units • Value: ${item.value.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-2">Recommended Action:</p>
                    <Badge className="bg-blue-600 text-white">{item.action}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical Inventory Count Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inventoryCounts.map((count, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-semibold">{count.location}</p>
                  <p className="text-sm text-gray-600">{count.items} items • Last count: {count.lastCount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Scheduled: {count.scheduled}</p>
                  <Badge className={
                    count.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    count.status === 'pending' ? 'bg-amber-500 text-white' :
                    'bg-green-500 text-white'
                  }>
                    {count.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4 bg-gradient-to-r from-red-600 to-blue-600">
            Schedule New Count
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReporting;
