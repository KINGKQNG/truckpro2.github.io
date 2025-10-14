import React, { useState } from 'react';
import { MOCK_WORK_ORDERS } from '../mock/data';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const FleetApprovals = () => {
  const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);
  const { toast } = useToast();

  const pendingOrders = workOrders.filter(wo => wo.approvalStatus === 'pending');

  const handleApprove = (orderId) => {
    setWorkOrders(prev => prev.map(wo => wo.id === orderId ? { ...wo, approvalStatus: 'approved' } : wo));
    toast({
      title: "Work Order Approved",
      description: "The work order has been approved and the technician can proceed.",
    });
  };

  const handleReject = (orderId) => {
    setWorkOrders(prev => prev.map(wo => wo.id === orderId ? { ...wo, approvalStatus: 'rejected' } : wo));
    toast({
      title: "Work Order Rejected",
      description: "The work order has been rejected.",
      variant: "destructive"
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fleet Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve service estimates for your fleet</p>
      </div>

      {pendingOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-gray-600">You have no pending approvals at this time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {pendingOrders.map((wo) => (
            <Card key={wo.id} className="border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{wo.workOrderNumber}</h3>
                        <Badge className="bg-amber-500 text-white">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          Pending Approval
                        </Badge>
                      </div>
                      <p className="text-gray-600">{wo.truck}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estimated Cost</p>
                      <p className="text-3xl font-bold text-blue-600">${wo.estimatedCost.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-semibold mb-2">Description:</p>
                    <p className="text-gray-700">{wo.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Parts Required:</h4>
                      <div className="space-y-2">
                        {wo.parts.map((part, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                            <span>{part.name} (x{part.quantity})</span>
                            <span className="font-medium">${part.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Labor:</h4>
                      <div className="space-y-2">
                        {wo.labor.map((labor, idx) => (
                          <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                            <span>{labor.description} ({labor.hours}h)</span>
                            <span className="font-medium">${labor.cost.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <Button onClick={() => handleApprove(wo.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button onClick={() => handleReject(wo.id)} variant="outline" className="flex-1 border-red-600 text-red-600 hover:bg-red-50">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FleetApprovals;
