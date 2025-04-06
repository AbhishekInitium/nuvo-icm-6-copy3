
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Download, Database } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { saveSystemConfig, getSystemConfig, SystemConfigInput } from '@/api/system';

// Define the validation schema for system configuration
const systemConfigSchema = z.object({
  clientId: z.string().min(3, { message: "Client ID must be at least 3 characters" }),
  mongoUri: z.string().min(10, { message: "MongoDB URI must be at least 10 characters" })
    .regex(/^mongodb(\+srv)?:\/\//, { message: "MongoDB URI must start with mongodb:// or mongodb+srv://" }),
  sapSystemId: z.string().optional(),
  sapBaseUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  sapUsername: z.string().optional(),
  sapPassword: z.string().optional()
});

interface KpiMapping {
  id: string;
  kpiName: string;
  apiEndpoint: string;
}

type FormValues = z.infer<typeof systemConfigSchema>;

export function SystemConfig() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [kpiMappings, setKpiMappings] = useState<KpiMapping[]>([{ id: '1', kpiName: '', apiEndpoint: '' }]);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      clientId: user?.clientId || 'client_001',
      mongoUri: '',
      sapSystemId: '',
      sapBaseUrl: '',
      sapUsername: '',
      sapPassword: ''
    }
  });

  // Handle KPI mapping changes
  const handleKpiChange = (id: string, field: 'kpiName' | 'apiEndpoint', value: string) => {
    setKpiMappings(prev => 
      prev.map(mapping => mapping.id === id ? { ...mapping, [field]: value } : mapping)
    );
  };

  // Add new KPI mapping row
  const addKpiMapping = () => {
    const newId = String(Date.now());
    setKpiMappings(prev => [...prev, { id: newId, kpiName: '', apiEndpoint: '' }]);
  };

  // Remove KPI mapping row
  const removeKpiMapping = (id: string) => {
    if (kpiMappings.length <= 1) {
      toast({
        title: "Cannot Remove",
        description: "At least one KPI mapping is required",
        variant: "destructive"
      });
      return;
    }
    
    setKpiMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  // Save configuration
  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      // Prepare the data for the API
      const configData: SystemConfigInput = {
        clientId: data.clientId,
        mongoUri: data.mongoUri,
        sapSystemId: data.sapSystemId,
        sapBaseUrl: data.sapBaseUrl,
        sapUsername: data.sapUsername,
        sapPassword: data.sapPassword
      };
      
      // Save the configuration
      const response = await saveSystemConfig(configData);
      
      if (response.success) {
        toast({
          title: "Configuration Saved",
          description: response.message || "System configuration has been saved successfully",
        });
      } else {
        throw new Error(response.error || "Failed to save configuration");
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "There was an error saving the configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load existing configuration
  const loadConfig = async () => {
    const clientId = form.getValues('clientId');
    if (!clientId) {
      toast({
        title: "Client ID Required",
        description: "Please enter a client ID to load configuration",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await getSystemConfig(clientId);
      
      if (response.success && response.data) {
        const config = response.data;
        
        // Update form with response data
        form.reset({
          clientId: config.clientId,
          mongoUri: config.mongoUri || '',
          sapSystemId: config.sapSystemId || '',
          sapBaseUrl: config.sapBaseUrl || '',
          sapUsername: config.sapUsername || '',
          sapPassword: config.sapPassword || ''
        });
        
        // Update KPI mappings if available
        if (config.kpiApiMappings && Array.isArray(config.kpiApiMappings)) {
          setKpiMappings(config.kpiApiMappings.map((mapping: any, index: number) => ({
            id: String(index + 1),
            kpiName: mapping.kpiName || '',
            apiEndpoint: mapping.apiEndpoint || ''
          })));
        }
        
        toast({
          title: "Configuration Loaded",
          description: `System configuration for ${config.clientId} has been loaded.`
        });
      } else {
        throw new Error(response.error || "Failed to load configuration");
      }
    } catch (error) {
      console.error('Error loading config:', error);
      toast({
        title: "Load Failed",
        description: error instanceof Error ? error.message : "There was an error loading the configuration.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        System Integration Configuration
      </h1>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-8 flex gap-4 justify-end">
            <Button 
              variant="outline" 
              type="button"
              onClick={loadConfig} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Load Existing
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
            >
              <Save size={16} />
              Save Configuration
            </Button>
          </div>
          
          {/* MongoDB Configuration */}
          <Card className="mb-6">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="text-indigo-700 text-lg font-bold flex items-center gap-2">
                <Database size={18} />
                Database Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., client_001"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mongoUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MongoDB URI</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., mongodb://username:password@host:port/database"
                        />
                      </FormControl>
                      <FormDescription>
                        Connection string for MongoDB database
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* SAP System Connection */}
          <Card className="mb-6">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700 text-lg font-bold">
                SAP System Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="sapSystemId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAP System ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., PRD, DEV, QAS"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sapBaseUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAP Base URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., https://sap-api.example.com/client1"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sapUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAP Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., sap_service_user"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sapPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SAP Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* KPI API Mappings */}
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-700 text-lg font-bold">
                KPI API Mappings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/5">KPI Name</TableHead>
                    <TableHead className="w-1/2">API Endpoint</TableHead>
                    <TableHead className="w-1/12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kpiMappings.map(mapping => (
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
                          type="button"
                          onClick={() => removeKpiMapping(mapping.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
                type="button"
                onClick={addKpiMapping}
                className="mt-4 flex items-center gap-2"
              >
                <Plus size={16} />
                Add KPI Mapping
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default SystemConfig;
