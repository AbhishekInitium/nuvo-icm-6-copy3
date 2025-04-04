
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface KpiMapping {
  id: string;
  kpiName: string;
  apiEndpoint: string;
}

interface SystemConfigForm {
  clientId: string;
  clientName: string;
  sapSystemId: string;
  sapBaseUrl: string;
  sapUsername: string;
  sapPassword: string;
  mongoCollectionsPrefix: string;
  kpiMappings: KpiMapping[];
}

export function SystemConfig() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<SystemConfigForm>({
    clientId: user?.clientId || '',
    clientName: '',
    sapSystemId: '',
    sapBaseUrl: '',
    sapUsername: '',
    sapPassword: '',
    mongoCollectionsPrefix: '',
    kpiMappings: [{ id: '1', kpiName: '', apiEndpoint: '' }]
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle KPI mapping changes
  const handleKpiChange = (id: string, field: 'kpiName' | 'apiEndpoint', value: string) => {
    setFormData(prev => ({
      ...prev,
      kpiMappings: prev.kpiMappings.map(mapping => 
        mapping.id === id ? { ...mapping, [field]: value } : mapping
      )
    }));
  };

  // Add new KPI mapping row
  const addKpiMapping = () => {
    const newId = String(Date.now());
    setFormData(prev => ({
      ...prev,
      kpiMappings: [...prev.kpiMappings, { id: newId, kpiName: '', apiEndpoint: '' }]
    }));
  };

  // Remove KPI mapping row
  const removeKpiMapping = (id: string) => {
    if (formData.kpiMappings.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one KPI mapping is required",
        variant: "destructive"
      });
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      kpiMappings: prev.kpiMappings.filter(mapping => mapping.id !== id)
    }));
  };

  // Save configuration
  const saveConfig = async () => {
    try {
      setLoading(true);
      
      // Format data for API
      const apiData = {
        clientId: formData.clientId,
        clientName: formData.clientName,
        sapSystemId: formData.sapSystemId,
        sapBaseUrl: formData.sapBaseUrl,
        sapUsername: formData.sapUsername,
        sapPassword: formData.sapPassword,
        mongoCollectionsPrefix: formData.mongoCollectionsPrefix,
        kpiApiMappings: formData.kpiMappings.map(({ kpiName, apiEndpoint }) => ({
          kpiName,
          sourceType: 'External',
          sourceField: kpiName,
          apiEndpoint
        }))
      };
      
      // Mock API call for now
      console.log('Saving config:', apiData);
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Configuration Saved",
        description: `System configuration for ${formData.clientId} has been saved.`
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving the configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load existing configuration
  const loadConfig = async () => {
    if (!formData.clientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter a client ID to load configuration",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Mock API call for now
      console.log('Loading config for client:', formData.clientId);
      
      // Simulate API response with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock response data
      const mockResponse = {
        clientId: formData.clientId,
        clientName: 'ACME Corporation',
        sapSystemId: 'PRD',
        sapBaseUrl: 'https://sap-api.example.com/client1',
        sapUsername: 'sapuser1',
        sapPassword: '********', // Password would be masked
        mongoCollectionsPrefix: 'client1_',
        kpiApiMappings: [
          { kpiName: 'sales', sourceType: 'External', sourceField: 'sales', apiEndpoint: '/api/sales' },
          { kpiName: 'inventory', sourceType: 'External', sourceField: 'inventory', apiEndpoint: '/api/inventory' }
        ]
      };
      
      // Update form data with response
      setFormData({
        clientId: mockResponse.clientId,
        clientName: mockResponse.clientName,
        sapSystemId: mockResponse.sapSystemId,
        sapBaseUrl: mockResponse.sapBaseUrl,
        sapUsername: mockResponse.sapUsername,
        sapPassword: mockResponse.sapPassword,
        mongoCollectionsPrefix: mockResponse.mongoCollectionsPrefix,
        kpiMappings: mockResponse.kpiApiMappings.map((mapping, index) => ({
          id: String(index + 1),
          kpiName: mapping.kpiName,
          apiEndpoint: mapping.apiEndpoint || ''
        }))
      });
      
      toast({
        title: "Configuration Loaded",
        description: `System configuration for ${formData.clientId} has been loaded.`
      });
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Load Failed",
        description: "There was an error loading the configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1a202c' }}>
        System Integration Configuration
      </h1>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <Button 
          variant="outline" 
          onClick={loadConfig} 
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Download size={16} />
          Load Existing
        </Button>
        <Button 
          onClick={saveConfig} 
          disabled={loading}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            backgroundColor: '#004c97'
          }}
        >
          <Save size={16} />
          Save Configuration
        </Button>
      </div>
      
      {/* Client Information */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader style={{ backgroundColor: 'rgba(0, 76, 151, 0.1)' }}>
          <CardTitle style={{ color: '#004c97', fontSize: '1.25rem', fontWeight: 'bold' }}>
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                placeholder="e.g., client_001"
              />
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                placeholder="e.g., ACME Corporation"
              />
            </div>
            <div>
              <Label htmlFor="sapSystemId">SAP System ID</Label>
              <Input
                id="sapSystemId"
                name="sapSystemId"
                value={formData.sapSystemId}
                onChange={handleChange}
                placeholder="e.g., PRD, DEV, QAS"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* SAP System Connection */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
          <CardTitle style={{ color: '#065f46', fontSize: '1.25rem', fontWeight: 'bold' }}>
            SAP System Connection
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            <div>
              <Label htmlFor="sapBaseUrl">SAP Base URL</Label>
              <Input
                id="sapBaseUrl"
                name="sapBaseUrl"
                value={formData.sapBaseUrl}
                onChange={handleChange}
                placeholder="e.g., https://sap-api.example.com/client1"
              />
            </div>
            <div>
              <Label htmlFor="sapUsername">SAP Username</Label>
              <Input
                id="sapUsername"
                name="sapUsername"
                value={formData.sapUsername}
                onChange={handleChange}
                placeholder="e.g., sap_service_user"
              />
            </div>
            <div>
              <Label htmlFor="sapPassword">SAP Password</Label>
              <Input
                id="sapPassword"
                name="sapPassword"
                type="password"
                value={formData.sapPassword}
                onChange={handleChange}
                placeholder="********"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* MongoDB Settings */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <CardHeader style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)' }}>
          <CardTitle style={{ color: '#92400e', fontSize: '1.25rem', fontWeight: 'bold' }}>
            MongoDB Settings
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '1.5rem' }}>
          <div>
            <Label htmlFor="mongoCollectionsPrefix">MongoDB Collections Prefix</Label>
            <Input
              id="mongoCollectionsPrefix"
              name="mongoCollectionsPrefix"
              value={formData.mongoCollectionsPrefix}
              onChange={handleChange}
              placeholder="e.g., client1_"
            />
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              This prefix will be applied to all MongoDB collections for this client.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* KPI API Mappings */}
      <Card>
        <CardHeader style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
          <CardTitle style={{ color: '#6d28d9', fontSize: '1.25rem', fontWeight: 'bold' }}>
            KPI API Mappings
          </CardTitle>
        </CardHeader>
        <CardContent style={{ padding: '1.5rem' }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '40%' }}>KPI Name</TableHead>
                <TableHead style={{ width: '50%' }}>API Endpoint</TableHead>
                <TableHead style={{ width: '10%' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formData.kpiMappings.map(mapping => (
                <TableRow key={mapping.id}>
                  <TableCell>
                    <Input
                      value={mapping.kpiName}
                      onChange={(e) => handleKpiChange(mapping.id, 'kpiName', e.target.value)}
                      placeholder="e.g., sales"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={mapping.apiEndpoint}
                      onChange={(e) => handleKpiChange(mapping.id, 'apiEndpoint', e.target.value)}
                      placeholder="e.g., /api/sales"
                    />
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeKpiMapping(mapping.id)}
                      style={{ color: '#e11d48' }}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <Button
            variant="outline"
            onClick={addKpiMapping}
            className="mt-4"
            style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            Add KPI Mapping
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default SystemConfig;
