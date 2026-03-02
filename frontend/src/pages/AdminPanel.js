import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { Users, Settings, Eye, Edit2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { usersAPI } from '../services/api';

const AVAILABLE_TILES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Overview and KPIs' },
  { id: 'work_orders', name: 'Work Orders', description: 'Service work order management' },
  { id: 'technicians', name: 'Technicians', description: 'Tech tracking and skill matrix' },
  { id: 'customers', name: 'Customers', description: 'Customer and fleet management' },
  { id: 'inventory', name: 'Inventory', description: 'Parts and inventory control' },
  { id: 'payments', name: 'Payments', description: 'Payment processing' },
  { id: 'reports', name: 'Reports', description: 'Analytics and reporting' },
  { id: 'approvals', name: 'Fleet Approvals', description: 'Estimate approvals' },
  { id: 'admin_panel', name: 'Admin Panel', description: 'User and system management' },
  { id: 'integrations', name: 'Integrations', description: 'External system integrations' }
];

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTiles, setUserTiles] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await usersAPI.getAll();
        setUsers(response.data || []);
      } catch (error) {
        toast({
          title: 'Load failed',
          description: 'Unable to load users',
          variant: 'destructive'
        });
      }
    };

    loadUsers();
  }, [toast]);

  const handleEditTiles = (user) => {
    setSelectedUser(user);
    setUserTiles([...user.tiles]);
  };

  const toggleTile = (tileId) => {
    setUserTiles(prev =>
      prev.map(t =>
        t.tile_id === tileId ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  const addTile = (tileId) => {
    const tile = AVAILABLE_TILES.find(t => t.id === tileId);
    if (tile && !userTiles.find(t => t.tile_id === tileId)) {
      setUserTiles(prev => [
        ...prev,
        {
          tile_id: tile.id,
          tile_name: tile.name,
          enabled: true,
          order: prev.length + 1
        }
      ]);
    }
  };

  const removeTile = (tileId) => {
    setUserTiles(prev => prev.filter(t => t.tile_id !== tileId));
  };

  const saveTiles = async () => {
    try {
      const response = await usersAPI.updateTiles(selectedUser.id, userTiles);
      setUsers(prev => prev.map(u => (u.id === selectedUser.id ? response.data : u)));
      toast({
        title: "Tiles Updated",
        description: `Tiles have been updated for ${selectedUser.name}`,
      });
      setSelectedUser(null);
      setUserTiles([]);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Unable to save tile permissions',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-white';
      case 'service_manager': return 'bg-blue-600 text-white';
      case 'technician': return 'bg-green-600 text-white';
      case 'fleet_manager': return 'bg-purple-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-panel-page">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">Manage users, permissions, and system settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.isActive).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
            <Settings className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{user.name}</h3>
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    {user.isActive ? (
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {user.tiles.filter(t => t.enabled).length} tiles enabled
                  </p>
                </div>

                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTiles(user)}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Tiles
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Tiles for {selectedUser?.name}</DialogTitle>
                        <DialogDescription data-testid="admin-tile-dialog-description">Enable, disable, or reorder navigation tiles for this user.</DialogDescription>
                      </DialogHeader>
                      {selectedUser && (
                        <div className="space-y-6">
                          <div>
                            <h3 className="font-semibold mb-3">Current Tiles</h3>
                            <div className="space-y-2">
                              {userTiles.map((tile) => (
                                <div
                                  key={tile.tile_id}
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center gap-3">
                                    <Switch
                                      checked={tile.enabled}
                                      onCheckedChange={() => toggleTile(tile.tile_id)}
                                    />
                                    <div>
                                      <p className="font-medium">{tile.tile_name}</p>
                                      <p className="text-xs text-gray-500">
                                        {AVAILABLE_TILES.find(t => t.id === tile.tile_id)?.description}
                                      </p>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeTile(tile.tile_id)}
                                    className="text-red-600"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-3">Add Tile</h3>
                            <Select onValueChange={addTile}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a tile to add" />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_TILES.filter(
                                  t => !userTiles.find(ut => ut.tile_id === t.id)
                                ).map((tile) => (
                                  <SelectItem key={tile.id} value={tile.id}>
                                    {tile.name} - {tile.description}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedUser(null);
                                setUserTiles([]);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              data-testid="admin-panel-save-tiles-button"
                              className="bg-gradient-to-r from-red-600 to-blue-600"
                              onClick={saveTiles}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">API Version</p>
              <p className="font-semibold">1.0.0</p>
            </div>
            <div>
              <p className="text-gray-600">Database</p>
              <p className="font-semibold">MongoDB</p>
            </div>
            <div>
              <p className="text-gray-600">Backend Status</p>
              <Badge className="bg-green-500 text-white">Online</Badge>
            </div>
            <div>
              <p className="text-gray-600">Last Backup</p>
              <p className="font-semibold">2 hours ago</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;
