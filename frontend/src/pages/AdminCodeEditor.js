import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Code, Save, Eye, RefreshCw, Download, Upload } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { codeEditorAPI } from '../services/api';

const AdminCodeEditor = () => {
  const { toast } = useToast();
  const [selectedPage, setSelectedPage] = useState('dashboard');
  const [selectedComponent, setSelectedComponent] = useState('');
  
  const [pages] = useState([
    { id: 'dashboard', name: 'Dashboard', path: '/pages/Dashboard.js' },
    { id: 'work-orders', name: 'Work Orders', path: '/pages/WorkOrders.js' },
    { id: 'walk-around', name: 'Walk-Around', path: '/pages/ServiceLane/WalkAround.js' },
    { id: 'obd-scanner', name: 'OBD Scanner', path: '/pages/ServiceLane/OBDScanner.js' },
    { id: 'lead-management', name: 'Lead Management', path: '/pages/CRM/LeadManagement.js' },
    { id: 'customers', name: 'Customers', path: '/pages/Customers.js' }
  ]);

  const [jsCode, setJsCode] = useState(`import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const CustomComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Component</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Count: {count}</p>
        <Button onClick={() => setCount(count + 1)}>
          Increment
        </Button>
      </CardContent>
    </Card>
  );
};

export default CustomComponent;`);

  const [cssCode, setCssCode] = useState(`.custom-dashboard {
  background: linear-gradient(to right, #dc2626, #2563eb);
  padding: 2rem;
  border-radius: 0.5rem;
}

.custom-card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.custom-card:hover {
  transform: translateY(-4px);
}

.custom-button {
  background: linear-gradient(to right, #ef4444, #3b82f6);
  color: white;
  font-weight: 600;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.custom-button:hover {
  opacity: 0.9;
  transform: scale(1.05);
}`);

  const [actionCode, setActionCode] = useState(`// Button Click Handler
const handleSaveWorkOrder = async () => {
  try {
    const response = await fetch('/api/work-orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${token}\`
      },
      body: JSON.stringify(workOrderData)
    });
    
    if (response.ok) {
      toast({
        title: "Success",
        description: "Work order saved successfully"
      });
    }
  } catch (error) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive"
    });
  }
};

// Data Fetching
const fetchWorkOrders = async () => {
  const response = await fetch('/api/work-orders');
  const data = await response.json();
  setWorkOrders(data);
};

// Form Validation
const validateForm = (data) => {
  if (!data.customer_id) {
    throw new Error("Customer is required");
  }
  if (!data.truck_id) {
    throw new Error("Vehicle is required");
  }
  return true;
};`);

  useEffect(() => {
    const loadPageCode = async () => {
      try {
        const response = await codeEditorAPI.getPage(selectedPage);
        if (response.data.jsCode) setJsCode(response.data.jsCode);
        if (response.data.cssCode) setCssCode(response.data.cssCode);
        if (response.data.actionCode) setActionCode(response.data.actionCode);
      } catch (error) {
        // Keep existing defaults
      }
    };

    loadPageCode();
  }, [selectedPage]);

  const handleSaveCode = async () => {
    try {
      await codeEditorAPI.savePage(selectedPage, { jsCode, cssCode, actionCode });
      toast({
        title: "Code Saved",
        description: `Changes saved for ${pages.find(p => p.id === selectedPage)?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Unable to save code changes',
        variant: 'destructive'
      });
    }
  };

  const handlePreview = () => {
    toast({
      title: "Preview Mode",
      description: "Opening live preview in new window...",
    });
  };

  const handleExport = () => {
    const blob = new Blob([jsCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPage}.js`;
    a.click();
    
    toast({
      title: "Exported",
      description: "Component code downloaded",
    });
  };

  return (
    <div className="p-6 space-y-6" data-testid="admin-code-editor-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Code Editor</h1>
          <p className="text-gray-600 mt-1">Customize pages, components, and button actions</p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="code-editor-export-button" variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button data-testid="code-editor-preview-button" variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button data-testid="code-editor-save-button" onClick={handleSaveCode} className="bg-gradient-to-r from-red-600 to-blue-600">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Page Selection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pages.map((page) => (
              <Button
                key={page.id}
                variant={selectedPage === page.id ? 'default' : 'outline'}
                onClick={() => setSelectedPage(page.id)}
                className={`w-full justify-start ${selectedPage === page.id ? 'bg-gradient-to-r from-red-600 to-blue-600' : ''}`}
              >
                <Code className="h-4 w-4 mr-2" />
                {page.name}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Code Editor</CardTitle>
              <Badge variant="outline">{pages.find(p => p.id === selectedPage)?.path}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="javascript">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="javascript">JavaScript/React</TabsTrigger>
                <TabsTrigger value="css">CSS Styling</TabsTrigger>
                <TabsTrigger value="actions">Button Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="javascript" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">React Component Code</label>
                  <Textarea
                    value={jsCode}
                    onChange={(e) => setJsCode(e.target.value)}
                    className="font-mono text-sm min-h-[500px]"
                    placeholder="Enter React component code..."
                  />
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-600 text-white">ES6</Badge>
                  <Badge className="bg-green-600 text-white">React Hooks</Badge>
                  <Badge className="bg-purple-600 text-white">TypeScript Support</Badge>
                </div>
              </TabsContent>

              <TabsContent value="css" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Custom CSS Styles</label>
                  <Textarea
                    value={cssCode}
                    onChange={(e) => setCssCode(e.target.value)}
                    className="font-mono text-sm min-h-[500px]"
                    placeholder="Enter CSS styles..."
                  />
                </div>
                <div className="flex gap-2">
                  <Badge className="bg-blue-600 text-white">Tailwind Compatible</Badge>
                  <Badge className="bg-green-600 text-white">CSS Modules</Badge>
                  <Badge className="bg-purple-600 text-white">PostCSS</Badge>
                </div>
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Button Click Actions & API Calls</label>
                  <Textarea
                    value={actionCode}
                    onChange={(e) => setActionCode(e.target.value)}
                    className="font-mono text-sm min-h-[500px]"
                    placeholder="Enter button action handlers..."
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Available API Endpoints:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline">POST /api/work-orders</Badge>
                    <Badge variant="outline">GET /api/work-orders</Badge>
                    <Badge variant="outline">PUT /api/work-orders/:id</Badge>
                    <Badge variant="outline">POST /api/auth/login</Badge>
                    <Badge variant="outline">GET /api/customers</Badge>
                    <Badge variant="outline">POST /api/payments</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">Data Table</h4>
              <p className="text-sm text-gray-600">Sortable table with pagination</p>
              <Button size="sm" variant="outline" className="mt-2">
                Insert Template
              </Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">Form Builder</h4>
              <p className="text-sm text-gray-600">Multi-step form with validation</p>
              <Button size="sm" variant="outline" className="mt-2">
                Insert Template
              </Button>
            </div>
            <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <h4 className="font-semibold mb-2">API Integration</h4>
              <p className="text-sm text-gray-600">Fetch data with loading states</p>
              <Button size="sm" variant="outline" className="mt-2">
                Insert Template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Component Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold">Button</p>
                <code className="text-xs text-gray-600">&lt;Button&gt;Click me&lt;/Button&gt;</code>
              </div>
              <Button size="sm" variant="outline">Copy Code</Button>
            </div>
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold">Card</p>
                <code className="text-xs text-gray-600">&lt;Card&gt;&lt;CardContent&gt;...&lt;/CardContent&gt;&lt;/Card&gt;</code>
              </div>
              <Button size="sm" variant="outline">Copy Code</Button>
            </div>
            <div className="p-3 border rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold">Dialog</p>
                <code className="text-xs text-gray-600">&lt;Dialog&gt;&lt;DialogContent&gt;...&lt;/DialogContent&gt;&lt;/Dialog&gt;</code>
              </div>
              <Button size="sm" variant="outline">Copy Code</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCodeEditor;
