import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Eye, Plus, AlertCircle, Clock, CheckCircle, Calendar, Edit, Trash2, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useSearchParams } from 'react-router-dom';
import { workOrdersAPI } from '../services/api';

const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const loadWorkOrders = async () => {
    try {
      const status = filterStatus === 'all' ? null : filterStatus;
      const response = await workOrdersAPI.getAll(status);
      setWorkOrders(response.data);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load work orders',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadWorkOrders();
  }, [filterStatus]);

  useEffect(() => {
    const targetId = searchParams.get('id');
    if (targetId && workOrders.length > 0) {
      const found = workOrders.find((wo) => wo.id === targetId);
      if (found) {
        setSelectedOrder(found);
        setIsDetailOpen(true);
      }
    }
  }, [searchParams, workOrders]);

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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await workOrdersAPI.updateStatus(orderId, newStatus);
      await loadWorkOrders();
      const updatedOrder = selectedOrder ? { ...selectedOrder, status: newStatus } : null;
      setSelectedOrder(updatedOrder);
      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus.replace('_', ' ')}`,
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Unable to update status',
        variant: 'destructive'
      });
    }
  };

  const handleApprove = async (orderId) => {
    try {
      await workOrdersAPI.updateApproval(orderId, 'approved');
      await loadWorkOrders();
      toast({
        title: "Work Order Approved",
        description: "Customer has approved the work order",
      });
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: 'Approval failed',
        description: 'Unable to approve work order',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (orderId) => {
    try {
      await workOrdersAPI.updateApproval(orderId, 'rejected');
      await loadWorkOrders();
      toast({
        title: "Work Order Rejected",
        description: "Work order has been rejected",
        variant: "destructive"
      });
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: 'Reject failed',
        description: 'Unable to reject work order',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (orderId) => {
    try {
      await workOrdersAPI.remove(orderId);
      await loadWorkOrders();
      toast({
        title: "Work Order Deleted",
        description: "Work order has been removed",
      });
      setIsDetailOpen(false);
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: 'Unable to delete work order',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="work-orders-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="work-orders-title">Work Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track all service work orders</p>
        </div>
        <Button data-testid="work-orders-new-button" className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Work Order
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button data-testid="work-orders-filter-all" variant={filterStatus === 'all' ? 'default' : 'outline'} onClick={() => setFilterStatus('all')} className={filterStatus === 'all' ? 'bg-gradient-to-r from-red-600 to-blue-600' : ''}>
          All ({workOrders.length})
        </Button>
        <Button data-testid="work-orders-filter-pending" variant={filterStatus === 'pending_approval' ? 'default' : 'outline'} onClick={() => setFilterStatus('pending_approval')}>
          Pending Approval
        </Button>
        <Button data-testid="work-orders-filter-scheduled" variant={filterStatus === 'scheduled' ? 'default' : 'outline'} onClick={() => setFilterStatus('scheduled')}>
          Scheduled
        </Button>
        <Button data-testid="work-orders-filter-progress" variant={filterStatus === 'in_progress' ? 'default' : 'outline'} onClick={() => setFilterStatus('in_progress')}>
          In Progress
        </Button>
        <Button data-testid="work-orders-filter-completed" variant={filterStatus === 'completed' ? 'default' : 'outline'} onClick={() => setFilterStatus('completed')}>
          Completed
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map((wo) => (
          <Card key={wo.id} className={`hover:shadow-lg transition-all duration-300 ${getPriorityColor(wo.priority)}`} data-testid={`work-order-card-${wo.id}`}>
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
                    data-testid={`work-order-view-${wo.id}`}
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

      {/* Work Order Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Work Order Details - {selectedOrder?.workOrderNumber}</DialogTitle>
            <DialogDescription data-testid="work-order-detail-dialog-description">Review work order details, update status, and approve or reject service.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehicle</p>
                  <p className="font-semibold">{selectedOrder.truck}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Technician</p>
                  <p className="font-semibold">{selectedOrder.assignedTech}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date</p>
                  <p className="font-semibold">{new Date(selectedOrder.scheduledDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="p-3 bg-gray-50 rounded-lg">{selectedOrder.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Change Status</p>
                <Select 
                  value={selectedOrder.status} 
                  onValueChange={(value) => handleUpdateStatus(selectedOrder.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Parts</h4>
                  <div className="space-y-2">
                    {(selectedOrder.parts || []).map((part, idx) => (
                      <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-xs text-gray-600">{part.partNumber} • Qty: {part.quantity}</p>
                        </div>
                        <p className="font-bold">${(part.cost * part.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Labor</h4>
                  <div className="space-y-2">
                    {(selectedOrder.labor || []).map((labor, idx) => (
                      <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{labor.description}</p>
                          <p className="text-xs text-gray-600">{labor.hours}h @ ${labor.rate}/hr</p>
                        </div>
                        <p className="font-bold">${labor.cost.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Estimated Cost</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedOrder.estimatedCost.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter className="flex gap-2">
                {selectedOrder.approvalStatus === 'pending' && (
                  <>
                    <Button data-testid="work-order-approve-button" onClick={() => handleApprove(selectedOrder.id)} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button data-testid="work-order-reject-button" onClick={() => handleReject(selectedOrder.id)} variant="outline" className="border-red-600 text-red-600">
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                <Button data-testid="work-order-delete-button" onClick={() => handleDelete(selectedOrder.id)} variant="outline" className="border-red-600 text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button data-testid="work-order-close-button" onClick={() => setIsDetailOpen(false)} variant="outline">
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrders;
