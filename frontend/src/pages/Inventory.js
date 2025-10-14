import React, { useState } from 'react';
import { MOCK_INVENTORY, MOCK_PURCHASE_ORDERS } from '../mock/inventoryData';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, AlertTriangle, ShoppingCart, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const Inventory = () => {
  const [inventory, setInventory] = useState(MOCK_INVENTORY);
  const [purchaseOrders, setPurchaseOrders] = useState(MOCK_PURCHASE_ORDERS);
  const { toast } = useToast();

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low_stock': return 'bg-amber-500';
      case 'ok': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAutoReplenish = (item) => {
    const quantity = item.parLevel - item.quantity;
    const newPO = {
      id: `po${purchaseOrders.length + 1}`,
      orderNumber: `PO-2025-${String(purchaseOrders.length + 3).padStart(3, '0')}`,
      supplier: item.supplier,
      status: 'pending',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ ...item, quantity, total: quantity * item.unitCost }],
      totalAmount: quantity * item.unitCost
    };
    
    setPurchaseOrders([...purchaseOrders, newPO]);
    toast({
      title: "Purchase Order Created",
      description: `PO-${newPO.orderNumber} created for ${quantity} units of ${item.name}`,
    });
  };

  const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical');
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track parts, manage stock levels, and auto-replenishment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchaseOrders.filter(po => po.status === 'pending').length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{item.name}</h3>
                      <Badge className={`${getStatusColor(item.status)} text-white text-xs`}>
                        {item.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{item.partNumber} • {item.category}</p>
                    <p className="text-xs text-gray-500">{item.location}</p>
                  </div>
                  <div className="text-center mx-4">
                    <p className="text-2xl font-bold">{item.quantity}</p>
                    <p className="text-xs text-gray-500">of {item.parLevel}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">${item.unitCost.toLocaleString()}/unit</p>
                    {(item.status === 'low_stock' || item.status === 'critical') && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="mt-2"
                        onClick={() => handleAutoReplenish(item)}
                      >
                        Auto Replenish
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchaseOrders.map((po) => (
                <div key={po.id} className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-sm">{po.orderNumber}</p>
                    <Badge className="bg-blue-600 text-white">{po.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{po.supplier}</p>
                  {po.items.map((item, idx) => (
                    <p key={idx} className="text-xs text-gray-700">
                      {item.name} x{item.quantity}
                    </p>
                  ))}
                  <div className="flex justify-between mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-600">Expected: {new Date(po.expectedDelivery).toLocaleDateString()}</p>
                    <p className="font-bold text-blue-600">${po.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
