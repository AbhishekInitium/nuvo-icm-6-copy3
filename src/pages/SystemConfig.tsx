import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save, Database, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { saveSystemConfig, getSystemConfig, SystemConfigInput, testConnection, setupConnection } from '@/api/system';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const databaseSetupSchema = z.object({
  clientId: z.string().min(3, { message: "Client ID must be at least 3 characters" })
    .regex(/^[A-Za-z0-9_-]+$/, { message: "Client ID can only contain letters, numbers, underscores and hyphens" }),
  mongoUri: z.string().min(10, { message: "MongoDB URI must be at least 10 characters" })
    .regex(/^mongodb(\+srv)?:\/\//, { message: "MongoDB URI must start with mongodb:// or mongodb+srv://" })
});

const systemConfigSchema = z.object({
  clientId: z.string().min(3, { message: "Client ID must be at least 3 characters" }),
  defaultCurrency: z.string().optional()
});

interface KpiMapping {
  id: string;
  kpiName: string;
  apiEndpoint: string;
}

type DatabaseSetupValues = z.infer<typeof databaseSetupSchema>;
type SystemConfigValues = z.infer<typeof systemConfigSchema>;

export function SystemConfig() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [settingUpConnection, setSettingUpConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'failed'>('untested');
  const [setupComplete, setSetupComplete] = useState(false);
  const [collections, setCollections] = useState<{ [key: string]: string } | null>(null);
  const [kpiMappings, setKpiMappings] = useState<KpiMapping[]>([{ id: '1', kpiName: '', apiEndpoint: '' }]);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  
  const setupForm = useForm<DatabaseSetupValues>({
    resolver: zodResolver(databaseSetupSchema),
    defaultValues: {
      clientId: user?.clientId || '',
      mongoUri: ''
    }
  });

  const configForm = useForm<SystemConfigValues>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: {
      clientId: user?.clientId || '',
      defaultCurrency: 'USD'
    }
  });

  useEffect(() => {
    const clientId = user?.clientId || setupForm.getValues('clientId');
    if (clientId) {
      loadConfig(clientId);
    }
  }, [user]);

  const handleKpiChange = (id: string, field: 'kpiName' | 'apiEndpoint', value: string) => {
    setKpiMappings(prev => 
      prev.map(mapping => mapping.id === id ? { ...mapping, [field]: value } : mapping)
    );
  };

  const addKpiMapping = () => {
    const newId = String(Date.now());
    setKpiMappings(prev => [...prev, { id: newId, kpiName: '', apiEndpoint: '' }]);
  };

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

  const handleTestConnection = async () => {
    const isValid = await setupForm.trigger();
    if (!isValid) return;
    
    try {
      setTestingConnection(true);
      setErrorDetails(null);
      const mongoUri = setupForm.getValues('mongoUri');
      
      const response = await testConnection(mongoUri);
      
      if (response.success) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "MongoDB connection test was successful",
        });
      } else {
        setConnectionStatus('failed');
        setErrorDetails(response.error || "Failed to connect to MongoDB");
        throw new Error(response.error || "Failed to connect to MongoDB");
      }
    } catch (error) {
      setConnectionStatus('failed');
      console.error('Error testing connection:', error);
      const errorMessage = error instanceof Error ? error.message : "There was an error testing the connection.";
      setErrorDetails(errorMessage);
      
      toast({
        title: "Connection Failed",
        description: "MongoDB connection test failed. See details below.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSetupConnection = async () => {
    const isValid = await setupForm.trigger();
    if (!isValid) return;
    
    try {
      setSettingUpConnection(true);
      const { clientId, mongoUri } = setupForm.getValues();
      
      const response = await setupConnection(clientId, mongoUri);
      
      if (response.success) {
        setSetupComplete(true);
        setCollections(response.data?.collections || null);
        
        configForm.setValue('clientId', clientId);
        
        toast({
          title: "Setup Complete",
          description: `Database setup completed successfully for client: ${clientId}`,
        });
      } else {
        throw new Error(response.error || "Failed to set up database");
      }
    } catch (error) {
      console.error('Error setting up connection:', error);
      toast({
        title: "Setup Failed",
        description: error instanceof Error ? error.message : "There was an error setting up the connection.",
        variant: "destructive"
      });
    } finally {
      setSettingUpConnection(false);
    }
  };

  const onSubmitConfig = async (data: SystemConfigValues) => {
    try {
      setLoading(true);
      
      const configData: SystemConfigInput = {
        clientId: data.clientId,
        mongoUri: setupForm.getValues('mongoUri'),
        defaultCurrency: data.defaultCurrency
      };
      
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

  const loadConfig = async (clientId: string) => {
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
      
      if (response.success) {
        setSetupComplete(response.setupComplete || false);
        
        if (response.data) {
          const config = response.data;
          
          configForm.reset({
            clientId: config.clientId,
            defaultCurrency: config.defaultCurrency || 'USD'
          });
          
          if (config.kpiApiMappings && Array.isArray(config.kpiApiMappings)) {
            setKpiMappings(config.kpiApiMappings.map((mapping: any, index: number) => ({
              id: String(index + 1),
              kpiName: mapping.kpiName || '',
              apiEndpoint: mapping.apiEndpoint || ''
            })));
          }
          
          if (config.masterSetupComplete) {
            setCollections({
              schemes: `${clientId}.schemes`,
              executionlogs: `${clientId}.executionlogs`,
              kpiconfigs: `${clientId}.kpiconfigs`,
              systemconfigs: `${clientId}.systemconfigs`,
            });
          }
          
          toast({
            title: "Configuration Loaded",
            description: `System configuration for ${config.clientId} has been loaded.`
          });
        } else if (response.setupComplete) {
          toast({
            title: "Database Setup Complete",
            description: `Database is configured for ${clientId} but no system configuration has been saved yet.`
          });
        } else {
          toast({
            title: "Database Setup Required",
            description: `Database setup is required for client ${clientId}.`,
            variant: "destructive"
          });
        }
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
      
      <Card className="mb-8">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-700 text-lg font-bold flex items-center gap-2">
            <Database size={18} />
            Database Connection Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...setupForm}>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={setupForm.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client ID</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., ACME"
                          disabled={setupComplete}
                        />
                      </FormControl>
                      <FormDescription>
                        Unique identifier for this client
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={setupForm.control}
                  name="mongoUri"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MongoDB URI</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., mongodb://username:password@host:port/NUVO_ICM_2"
                          disabled={setupComplete}
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

              {connectionStatus === 'failed' && errorDetails && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Failed</AlertTitle>
                  <AlertDescription className="mt-2 text-sm whitespace-pre-wrap">
                    {errorDetails}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <Button 
                  variant="outline" 
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection || setupComplete}
                  className="flex items-center gap-2"
                >
                  {testingConnection ? (
                    <>Testing...</>
                  ) : connectionStatus === 'success' ? (
                    <><Check size={16} className="text-green-600" /> Connection Valid</>
                  ) : connectionStatus === 'failed' ? (
                    <><AlertTriangle size={16} className="text-red-600" /> Connection Failed</>
                  ) : (
                    <>Test Connection</>
                  )}
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleSetupConnection}
                  disabled={settingUpConnection || setupComplete || connectionStatus !== 'success'}
                  className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
                >
                  {settingUpConnection ? 'Setting Up...' : 'Set Up Collections'}
                </Button>
              </div>
            </form>
          </Form>
          
          {setupComplete && collections && (
            <div className="mt-6 p-4 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-green-800 font-medium flex items-center gap-2">
                  <Check size={18} className="text-green-600" />
                  Database Setup Complete
                </h3>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {setupForm.getValues('clientId')}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">The following collections have been created:</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(collections).map(([key, value]) => (
                  <div key={key} className="flex items-center p-2 bg-white rounded border border-gray-200">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded mr-2">{key}</span>
                    <span className="text-xs font-mono text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Form {...configForm}>
        <form onSubmit={configForm.handleSubmit(onSubmitConfig)}>
          <div className="mb-8 flex gap-4 justify-end">
            <Button 
              type="submit" 
              disabled={loading || !setupComplete}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800"
            >
              <Save size={16} />
              Save Configuration
            </Button>
          </div>
          
          <Card className="mb-6">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-700 text-lg font-bold">
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={configForm.control}
                  name="defaultCurrency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Currency</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g., USD, EUR, GBP"
                          disabled={!setupComplete}
                        />
                      </FormControl>
                      <FormDescription>
                        Default currency for calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
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
                          disabled={!setupComplete}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={mapping.apiEndpoint}
                          onChange={(e) => handleKpiChange(mapping.id, 'apiEndpoint', e.target.value)}
                          placeholder="e.g., /api/sales"
                          disabled={!setupComplete}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          type="button"
                          onClick={() => removeKpiMapping(mapping.id)}
                          disabled={!setupComplete}
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
                disabled={!setupComplete}
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
