import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Phone, Mail, MessageSquare, Star, TrendingUp, User, DollarSign } from 'lucide-react';
import { Progress } from '../../components/ui/progress';
import { useToast } from '../../hooks/use-toast';

const LeadManagement = () => {
  const { toast } = useToast();
  
  const [leads] = useState([
    {
      id: 'L-2025-001',
      name: 'Robert Johnson',
      phone: '555-0234',
      email: 'robert@email.com',
      source: 'Website Form',
      score: 85,
      status: 'hot',
      vehicle: 'Peterbilt 579',
      lastContact: '2 hours ago',
      assigned: 'Sarah Martinez',
      equity: 15000,
      priority: 'high'
    },
    {
      id: 'L-2025-002',
      name: 'Jennifer Davis',
      phone: '555-0567',
      email: 'jennifer@fleet.com',
      source: 'Trade-In Inquiry',
      score: 92,
      status: 'hot',
      vehicle: 'Kenworth T680',
      lastContact: '4 hours ago',
      assigned: 'Mike Johnson',
      equity: 22000,
      priority: 'high'
    },
    {
      id: 'L-2025-003',
      name: 'David Wilson',
      phone: '555-0890',
      email: 'david@transport.com',
      source: 'Phone Call',
      score: 65,
      status: 'warm',
      vehicle: 'Freightliner Cascadia',
      lastContact: '1 day ago',
      assigned: 'Sarah Martinez',
      equity: 8500,
      priority: 'medium'
    },
    {
      id: 'L-2025-004',
      name: 'Lisa Anderson',
      phone: '555-0123',
      email: 'lisa@logistics.com',
      source: 'Social Media',
      score: 45,
      status: 'cold',
      vehicle: 'Volvo VNL',
      lastContact: '3 days ago',
      assigned: 'John Smith',
      equity: 3000,
      priority: 'low'
    }
  ]);

  const [leadStats] = useState({
    total: 248,
    hot: 42,
    warm: 89,
    cold: 117,
    avgResponseTime: 8.5,
    conversionRate: 24.5,
    avgLeadScore: 67
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'bg-red-500';
      case 'warm': return 'bg-amber-500';
      case 'cold': return 'bg-blue-400';
      default: return 'bg-gray-500';
    }
  };

  const handleCall = (lead) => {
    toast({
      title: "Initiating Call",
      description: `Calling ${lead.name} at ${lead.phone}...`,
    });
    // Simulate call integration
    setTimeout(() => {
      toast({
        title: "Call Connected",
        description: "Call duration tracking started",
      });
    }, 2000);
  };

  const handleEmail = (lead) => {
    toast({
      title: "Email Composer Opened",
      description: `Drafting email to ${lead.email}`,
    });
    // In real implementation, this would open email composer
  };

  const handleSMS = (lead) => {
    toast({
      title: "SMS Composer Opened",
      description: `Sending text to ${lead.phone}`,
    });
    // In real implementation, this would open SMS interface
  };

  const handleView360 = (lead) => {
    toast({
      title: "Loading 360° Profile",
      description: `Opening complete profile for ${lead.name}`,
    });
    // In real implementation, navigate to detailed profile
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Management & CRM</h1>
        <p className="text-gray-600 mt-1">Intelligent lead scoring and omnichannel communication</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Hot Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{leadStats.hot}</div>
            <Progress value={(leadStats.hot / leadStats.total) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Warm Leads</CardTitle>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{leadStats.warm}</div>
            <Progress value={(leadStats.warm / leadStats.total) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Response</CardTitle>
            <Star className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadStats.avgResponseTime} min</div>
            <p className="text-xs text-gray-500 mt-1">Target: Under 10 min</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{leadStats.conversionRate}%</div>
            <p className="text-xs text-gray-500 mt-1">Lead to sale</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-gradient-to-br from-red-50 to-blue-50 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold">{lead.name}</h3>
                        <Badge className={`${getStatusColor(lead.status)} text-white`}>
                          {lead.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">Score: {lead.score}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">{lead.id} • {lead.source}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600">Interested In</p>
                      <p className="font-semibold">{lead.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Assigned To</p>
                      <p className="font-semibold">{lead.assigned}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Last Contact</p>
                      <p className="font-semibold">{lead.lastContact}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Trade Equity</p>
                      <p className="font-semibold text-green-600">${lead.equity.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2">Lead Score Breakdown:</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Engagement</span>
                        <span className="font-semibold">{Math.floor(lead.score * 0.4)}%</span>
                      </div>
                      <Progress value={lead.score * 0.4} className="h-1" />
                      <div className="flex justify-between text-xs">
                        <span>Financial Readiness</span>
                        <span className="font-semibold">{Math.floor(lead.score * 0.6)}%</span>
                      </div>
                      <Progress value={lead.score * 0.6} className="h-1" />
                    </div>
                  </div>
                </div>

                <div className="ml-6 space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handleCall(lead)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEmail(lead)}
                    className="w-full"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSMS(lead)}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    SMS
                  </Button>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600"
                    onClick={() => handleView360(lead)}
                  >
                    View 360° Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lead Source Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { source: 'Website Form', leads: 89, conversion: 28.5 },
              { source: 'Trade-In Inquiry', leads: 56, conversion: 42.3 },
              { source: 'Phone Call', leads: 45, conversion: 18.7 },
              { source: 'Social Media', leads: 34, conversion: 12.4 },
              { source: 'Walk-In', leads: 24, conversion: 35.2 }
            ].map((source, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{source.source}</span>
                  <span className="text-gray-600">{source.leads} leads • {source.conversion}% conversion</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-red-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${source.conversion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadManagement;
