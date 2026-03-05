import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Building2, User, Phone, Mail, TruckIcon, Eye, Edit, History } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { customersAPI } from '../services/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerTrucks, setCustomerTrucks] = useState([]);
  const [customerWorkOrders, setCustomerWorkOrders] = useState([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await customersAPI.getAll();
        setCustomers(response.data);
      } catch (error) {
        toast({
          title: 'Load failed',
          description: 'Unable to load customers',
          variant: 'destructive'
        });
      }
    };

    loadCustomers();
  }, [toast]);

  const handleViewDetails = async (customer) => {
    try {
      const response = await customersAPI.getDetail(customer.id);
      setSelectedCustomer(response.data.customer);
      setCustomerTrucks(response.data.trucks || []);
      setCustomerWorkOrders(response.data.workOrders || []);
      setIsDetailOpen(true);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load customer details',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="customers-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="customers-title">Customers & Fleets</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and fleet information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-all duration-300" data-testid={`customer-card-${customer.id}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{customer.name}</CardTitle>
                  <Badge variant="outline" className="mt-2 capitalize">
                    {customer.type === 'fleet' ? <Building2 className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {customer.type}
                  </Badge>
                </div>
                <Badge className="bg-green-500 text-white">
                  {customer.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{customer.contact}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TruckIcon className="h-4 w-4" />
                <span>{customer.fleetSize} vehicles</span>
              </div>
              <div className="pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-bold text-blue-600">${customer.totalSpent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-medium">{new Date(customer.joinedDate).toLocaleDateString()}</span>
                </div>
              </div>
              <Button data-testid={`customer-view-button-${customer.id}`} variant="outline" className="w-full mt-4" onClick={() => handleViewDetails(customer)}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details - {selectedCustomer?.name}</DialogTitle>
            <DialogDescription data-testid="customer-detail-dialog-description">View customer contact details, fleet vehicles, and service history.</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Person</p>
                  <p className="font-semibold">{selectedCustomer.contact}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fleet Size</p>
                  <p className="font-semibold">{selectedCustomer.fleetSize} vehicles</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Fleet Vehicles ({customerTrucks.length})
                </h4>
                <div className="space-y-2">
                  {customerTrucks.map(truck => (
                    <div key={truck.id} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{truck.year} {truck.make} {truck.model}</p>
                        <p className="text-sm text-gray-600">Unit: {truck.unitNumber} • VIN: {truck.vin}</p>
                        <p className="text-xs text-gray-500">Mileage: {truck.mileage.toLocaleString()} miles</p>
                      </div>
                      <Badge className={truck.status === 'active' ? 'bg-green-500' : 'bg-amber-500'}>
                        {truck.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Service History ({customerWorkOrders.length})
                </h4>
                <div className="space-y-2">
                  {customerWorkOrders.map(wo => (
                    <div key={wo.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{wo.workOrderNumber}</p>
                          <p className="text-sm text-gray-600">{wo.description}</p>
                          <p className="text-xs text-gray-500">Date: {wo.scheduledDate}</p>
                        </div>
                        <div className="text-right">
                          <Badge>{wo.status.replace('_', ' ')}</Badge>
                          <p className="text-sm font-bold mt-1">${wo.estimatedCost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Lifetime Value</span>
                  <span className="text-2xl font-bold text-blue-600">${selectedCustomer.totalSpent.toLocaleString()}</span>
                </div>
              </div>

              <DialogFooter>
                <Button data-testid="customer-detail-close-button" variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
                <Button data-testid="customer-detail-edit-button" className="bg-gradient-to-r from-red-600 to-blue-600">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
// ...other imports and code

const LeadManagement = () => {
  // ...existing code
  const [is360Open, setIs360Open] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Helper - Returns true if last contact within 30 days
  const isRecentContact = (lead) => {
    const last = lead.lastContact ? new Date(lead.lastContact) : null;
    if (!last) return false;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - 30);
    return last >= daysAgo;
  };

  // Modal show handler
  const handleView360 = (lead) => {
    setSelectedLead(lead);
    setIs360Open(true);
    logInteraction(lead, 'profile_view', '360 profile viewed');
  };

  return (
    <>
      {/* Your lead grid and buttons... */}
      <Dialog open={is360Open} onOpenChange={setIs360Open}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.name} – 360° Profile Overview (Last 30 Days)
            </DialogTitle>
            <DialogDescription>
              Quick customer summary based on their latest status and activity.
            </DialogDescription>
          </DialogHeader>
          {selectedLead ? (
            <div>
              <p><strong>Status:</strong> {selectedLead.status}</p>
              <p><strong>Lead Score:</strong> {selectedLead.score}</p>
              <p><strong>Source:</strong> {selectedLead.source}</p>
              <p><strong>Assigned To:</strong> {selectedLead.assigned}</p>
              <p><strong>Interested In:</strong> {selectedLead.vehicle}</p>
              <p><strong>Trade Equity:</strong> ${selectedLead.equity?.toLocaleString()}</p>
              <p>
                <strong>Last Contact:</strong> {" "}
                {selectedLead.lastContact
                  ? `${new Date(selectedLead.lastContact).toLocaleDateString()}`
                  : "No contact recorded"}
                {isRecentContact(selectedLead) ? " (within last 30 days)" : " (no recent contact)"}
              </p>
            </div>
          ) : <div>No lead selected.</div>}
          <DialogFooter>
            <button onClick={() => setIs360Open(false)}>Close</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default LeadManagement;

};

export default Customers;
