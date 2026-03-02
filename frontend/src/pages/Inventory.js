import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Package, AlertTriangle, ShoppingCart, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { inventoryAPI } from '../services/api';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const { toast } = useToast();

  const loadInventoryData = async () => {
    try {
      const [inventoryResponse, poResponse] = await Promise.all([
        inventoryAPI.getAll(),
        inventoryAPI.getPurchaseOrders()
      ]);
      setInventory(inventoryResponse.data || []);
      setPurchaseOrders(poResponse.data || []);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load inventory data',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadInventoryData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'low_stock': return 'bg-amber-500';
      case 'ok': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAutoReplenish = async (item) => {
    try {
      const response = await inventoryAPI.autoReplenish(item.id);
      await loadInventoryData();
      toast({
        title: "Purchase Order Created",
        description: response.data.purchaseOrder
          ? `${response.data.purchaseOrder.orderNumber} created for ${item.name}`
          : `No replenishment needed for ${item.name}`,
      });
    } catch (error) {
      toast({
        title: 'Replenish failed',
        description: 'Unable to create purchase order',
        variant: 'destructive'
      });
    }
  };

  const lowStockItems = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical');
  const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  return (
    <div className="p-6 space-y-6" data-testid="inventory-page">
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
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50" data-testid={`inventory-item-${item.id}`}>
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
                        data-testid={`inventory-auto-replenish-${item.id}`}
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
