import React, { useState, useEffect } from 'react';
import { MOCK_WORK_ORDERS } from '../mock/data';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Eye, Plus, AlertCircle, Clock, CheckCircle, Calendar, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState(MOCK_WORK_ORDERS);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_approval': return <AlertCircle className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_approval': return 'bg-amber-500';
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-purple-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-l-red-500';
      case 'medium': return 'border-l-4 border-l-blue-500';
      case 'low': return 'border-l-4 border-l-gray-400';
      default: return '';
    }
  };

  const filteredOrders = filterStatus === 'all' ? workOrders : workOrders.filter(wo => wo.status === filterStatus);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? { ...wo, status: newStatus } : wo
    ));
    toast({
      title: "Status Updated",
      description: `Work order status changed to ${newStatus.replace('_', ' ')}`,
    });
  };

  const handleApprove = (orderId) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? { ...wo, approvalStatus: 'approved' } : wo
    ));
    toast({
      title: "Work Order Approved",
      description: "Customer has approved the work order",
    });
    setIsDetailOpen(false);
  };

  const handleReject = (orderId) => {
    setWorkOrders(prev => prev.map(wo => 
      wo.id === orderId ? { ...wo, approvalStatus: 'rejected' } : wo
    ));
    toast({
      title: "Work Order Rejected",
      description: "Work order has been rejected",
      variant: "destructive"
    });
    setIsDetailOpen(false);
  };

  const handleDelete = (orderId) => {
    setWorkOrders(prev => prev.filter(wo => wo.id !== orderId));
    toast({
      title: "Work Order Deleted",
      description: "Work order has been removed",
    });
    setIsDetailOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all service work orders</p>
        </div>
        <Button className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'bg-gradient-to-r from-red-600 to-blue-600' : ''}>
          All ({workOrders.length})
        </Button>
        <Button variant={filterStatus === 'pending_approval' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending_approval')}>
          Pending Approval
        </Button>
        <Button variant={filterStatus === 'scheduled' ? 'default' : 'outline'} onClick={() => setFilterStatus('scheduled')}>
          Scheduled
        </Button>
        <Button variant={filterStatus === 'in_progress' ? 'default' : 'outline'} onClick={() => setFilterStatus('in_progress')}>
          In Progress
        </Button>
        <Button variant={filterStatus === 'completed' ? 'default' : 'outline'} onClick={() => setFilterStatus('completed')}>
          Completed
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((wo) => (
          <Card key={wo.id} className={`hover:shadow-lg transition-all duration-300 ${getPriorityColor(wo.priority)}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{wo.workOrderNumber}</h3>
                    <Badge className={`${getStatusColor(wo.status)} text-white`}>
                      {getStatusIcon(wo.status)}
                      <span className="ml-1">{wo.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {wo.priority} Priority
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold">{wo.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Vehicle</p>
                      <p className="font-semibold">{wo.truck}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Technician</p>
                      <p className="font-semibold">{wo.assignedTech}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Scheduled Date</p>
                      <p className="font-semibold">{new Date(wo.scheduledDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-800">{wo.description}</p>
                  </div>
                </div>
                <div className="text-right space-y-4 ml-6">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-2xl font-bold text-blue-600">${wo.estimatedCost.toLocaleString()}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleViewDetails(wo)}
                    className="w-full"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WorkOrders;
