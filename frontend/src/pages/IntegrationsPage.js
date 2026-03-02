import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Database, RefreshCw, Settings, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { integrationsAPI } from '../services/api';

const IntegrationsPage = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState([]);

  const [newIntegration, setNewIntegration] = useState({
    system_type: 'sap',
    name: '',
    endpoint_url: '',
    username: '',
    password: '',
    api_key: ''
  });

  const loadIntegrations = async () => {
    try {
      const response = await integrationsAPI.getAll();
      setIntegrations(response.data || []);
    } catch (error) {
      toast({
        title: 'Load failed',
        description: 'Unable to load integrations',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, [toast]);

  const getSystemIcon = (type) => {
    return <Database className="h-8 w-8" />;
  };

  const getSystemColor = (type) => {
    switch(type) {
      case 'sap': return 'from-blue-500 to-blue-600';
      case 'logile': return 'from-purple-500 to-purple-600';
      case 'dos_matrix': return 'from-gray-600 to-gray-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleTestConnection = async (id) => {
    try {
      await integrationsAPI.test(id);
      await loadIntegrations();
      toast({
        title: "Connection Successful",
        description: "Integration is working properly",
      });
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Unable to connect integration',
        variant: 'destructive'
      });
    }
  };

  const handleSync = async (id, syncType) => {
    try {
      await integrationsAPI.sync(id, syncType);
      await loadIntegrations();
      toast({
        title: "Sync Complete",
        description: "Data synchronized successfully",
      });
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Unable to sync integration',
        variant: 'destructive'
      });
    }
  };

  const handleAddIntegration = async () => {
    try {
      await integrationsAPI.create(newIntegration);
      await loadIntegrations();
      toast({
        title: "Integration Added",
        description: `${newIntegration.name} has been added`,
      });
      setNewIntegration({
        system_type: 'sap',
        name: '',
        endpoint_url: '',
        username: '',
        password: '',
        api_key: ''
      });
    } catch (error) {
      toast({
        title: 'Create failed',
        description: 'Unable to add integration',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="integrations-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Integrations</h1>
          <p className="text-gray-600 mt-1">Connect to SAP, Logile, and DOS Matrix systems</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button data-testid="integrations-add-button" className="bg-gradient-to-r from-red-600 to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>System Type</Label>
                <Select
                  value={newIntegration.system_type}
                  onValueChange={(value) => setNewIntegration(prev => ({ ...prev, system_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sap">SAP ERP</SelectItem>
                    <SelectItem value="logile">Logile Time System</SelectItem>
                    <SelectItem value="dos_matrix">DOS Matrix (Legacy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Integration Name</Label>
                <Input
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., SAP Production Server"
                />
              </div>

              <div>
                <Label>Endpoint URL</Label>
                <Input
                  value={newIntegration.endpoint_url}
                  onChange={(e) => setNewIntegration(prev => ({ ...prev, endpoint_url: e.target.value }))}
                  placeholder="https://api.system.com or 192.168.1.100:5000"
                />
              </div>

              {newIntegration.system_type !== 'dos_matrix' && (
                <>
                  <div>
                    <Label>Username</Label>
                    <Input
                      value={newIntegration.username}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={newIntegration.password}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label>API Key (Optional)</Label>
                    <Input
                      value={newIntegration.api_key}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, api_key: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <Button data-testid="integrations-submit-button" onClick={handleAddIntegration} className="w-full bg-gradient-to-r from-red-600 to-blue-600">
                Add Integration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-gradient-to-br ${getSystemColor(integration.system_type)} rounded-lg`}>
                    {getSystemIcon(integration.system_type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{integration.name}</CardTitle>
                      {integration.status === 'connected' ? (
                        <Badge className="bg-green-500 text-white">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500 text-white">
                          <XCircle className="h-3 w-3 mr-1" />
                          Disconnected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{integration.endpoint_url}</p>
                    <Badge variant="outline" className="mt-2 capitalize">
                      {integration.system_type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium">
                    {integration.lastSync
                      ? new Date(integration.lastSync).toLocaleString()
                      : 'Never'}
                  </span>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <h4 className="font-semibold text-sm mb-3">Available Sync Operations</h4>
                  
                  {integration.system_type === 'sap' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'customers')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Customers
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'inventory')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Inventory
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'work_orders')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Push Work Orders
                      </Button>
                    </div>
                  )}

                  {integration.system_type === 'logile' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'hours')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Tech Hours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'timesheets')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Push Timesheets
                      </Button>
                    </div>
                  )}

                  {integration.system_type === 'dos_matrix' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'parts')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Parts
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(integration.id, 'inventory')}
                        disabled={!integration.isActive}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Inventory
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex gap-2">
                  <Button
                    data-testid={`integration-test-button-${integration.id}`}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(integration.id)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">SAP ERP</h4>
              <p className="text-gray-600">
                Synchronize customers, inventory levels, and push work orders as service orders to SAP. Uses OData API for real-time integration.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Logile Time System</h4>
              <p className="text-gray-600">
                Track technician hours and sync timesheets automatically. Pulls daily hours and pushes completed work order times.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">DOS Matrix (Legacy)</h4>
              <p className="text-gray-600">
                Connect to legacy DOS-based parts system using socket communication. Sync parts database and update inventory levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsPage;
