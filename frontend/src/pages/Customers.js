import React, { useState } from 'react';
import { MOCK_CUSTOMERS } from '../mock/data';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Building2, User, Phone, Mail, TruckIcon } from 'lucide-react';

const Customers = () => {
  const [customers] = useState(MOCK_CUSTOMERS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers & Fleets</h1>
          <p className="text-gray-600 mt-1">Manage customer accounts and fleet information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-all duration-300">
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
              <Button variant="outline" className="w-full mt-4">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Customers;
