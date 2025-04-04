
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Play, FileText, Upload, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { apiClient } from '@/api/client';

// Types for the scheme and execution logs
interface Scheme {
  schemeId: string;
  name: string;
  status: 'Draft' | 'Approved' | 'Simulated' | 'ProdRun';
  effectiveStart: string;
  effectiveEnd: string;
  createdAt: string;
  updatedAt: string;
}

interface ExecutionLog {
  runId: string;
  schemeId: string;
  mode: 'simulation' | 'production';
  executedAt: string;
  summary: {
    totalAgents: number;
    passed: number;
    failed: number;
    totalCommission: number;
  };
  agents: Array<{
    agentId: string;
    qualified: boolean;
    commission: number;
    qualifyingCriteria: Array<{
      rule: string;
      result: boolean;
      data: any;
    }>;
    exclusions: any[];
    adjustments: any[];
    customLogic: Array<{
      rule: string;
      result: boolean;
      notes: string;
    }>;
  }>;
}

export default function SchemeRun() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulateModalOpen, setSimulateModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [runningScheme, setRunningScheme] = useState(false);

  // Fetch schemes on component mount
  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      // Assuming client ID is available from auth context
      const clientId = user?.clientId;
      if (!clientId) {
        toast({
          title: 'Authentication Error',
          description: 'Client ID not available. Please log in again.',
          variant: 'destructive',
        });
        return;
      }

      const response = await apiClient.get(`/manager/schemes?clientId=${clientId}`);
      setSchemes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching schemes:', error);
      toast({
        title: 'Failed to load schemes',
        description: 'There was an error loading the schemes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setSimulateModalOpen(true);
  };

  const handleRunProduction = async (scheme: Scheme) => {
    if (scheme.status !== 'Approved') {
      toast({
        title: 'Cannot Run',
        description: 'Only approved schemes can be run in production.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRunningScheme(true);
      const response = await apiClient.post('/execute/run', {
        schemeId: scheme.schemeId,
        mode: 'production',
        clientId: user?.clientId,
      });

      if (response.data.success) {
        toast({
          title: 'Scheme Run Successfully',
          description: `Execution ID: ${response.data.data.runId}`,
        });
        // Refresh schemes to show updated status
        fetchSchemes();
      } else {
        throw new Error(response.data.error || 'Failed to run scheme');
      }
    } catch (error) {
      console.error('Error running scheme:', error);
      toast({
        title: 'Failed to run scheme',
        description: 'There was an error running the scheme in production. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRunningScheme(false);
    }
  };

  const handleViewLogs = async (scheme: Scheme) => {
    try {
      setSelectedScheme(scheme);
      const response = await apiClient.get(`/execute/logs?clientId=${user?.clientId}`);
      
      if (response.data.success) {
        // Filter logs for the selected scheme
        const schemeLogs = response.data.data.filter(
          (log: ExecutionLog) => log.schemeId === scheme.schemeId
        );
        setExecutionLogs(schemeLogs);
        setLogsModalOpen(true);
      } else {
        throw new Error(response.data.error || 'Failed to fetch execution logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: 'Failed to load execution logs',
        description: 'There was an error loading the execution logs. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleViewLogDetails = async (log: ExecutionLog) => {
    try {
      const response = await apiClient.get(`/execute/log/${log.runId}?clientId=${user?.clientId}`);
      
      if (response.data.success) {
        setSelectedLog(response.data.data);
      } else {
        throw new Error(response.data.error || 'Failed to fetch execution log details');
      }
    } catch (error) {
      console.error('Error fetching log details:', error);
      toast({
        title: 'Failed to load log details',
        description: 'There was an error loading the log details. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSubmitSimulation = async () => {
    if (!selectedScheme || !uploadFile) {
      toast({
        title: 'Missing Information',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setRunningScheme(true);
      
      // In a real implementation, you would upload the file and then submit for simulation
      // Here we're just simulating the API call without file upload
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('schemeId', selectedScheme.schemeId);
      formData.append('clientId', user?.clientId || '');

      // Mock simulation - in real implementation replace with actual API call
      const response = await apiClient.post('/execute/run', {
        schemeId: selectedScheme.schemeId,
        mode: 'simulation',
        clientId: user?.clientId,
      });

      if (response.data.success) {
        toast({
          title: 'Simulation Complete',
          description: `Simulation ID: ${response.data.data.runId}`,
        });
        setSimulateModalOpen(false);
        fetchSchemes();
      } else {
        throw new Error(response.data.error || 'Failed to run simulation');
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: 'Failed to run simulation',
        description: 'There was an error running the simulation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setRunningScheme(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'Approved':
        return <Badge variant="success" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'Simulated':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Simulated</Badge>;
      case 'ProdRun':
        return <Badge variant="destructive" className="bg-purple-100 text-purple-800">Production Run</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Incentive Scheme Execution</h1>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-2">Loading schemes...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Effective Period</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schemes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No schemes found. Create a scheme to get started.
                  </TableCell>
                </TableRow>
              ) : (
                schemes.map((scheme) => (
                  <TableRow key={scheme.schemeId}>
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell>{getStatusBadge(scheme.status)}</TableCell>
                    <TableCell>{format(new Date(scheme.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      {format(new Date(scheme.effectiveStart), 'MMM dd, yyyy')} - {format(new Date(scheme.effectiveEnd), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSimulate(scheme)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Simulate
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          disabled={scheme.status !== 'Approved' || runningScheme}
                          onClick={() => handleRunProduction(scheme)}
                        >
                          <BarChart className="h-4 w-4 mr-1" />
                          Run Production
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleViewLogs(scheme)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Logs
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Simulation Modal */}
      <Dialog open={simulateModalOpen} onOpenChange={setSimulateModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Run Simulation</DialogTitle>
            <DialogDescription>
              Upload sample data to simulate the scheme execution without affecting real data.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-10 w-10 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600">
                Upload CSV or Excel file with sample data
              </p>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md cursor-pointer hover:bg-primary/90"
              >
                Choose File
              </label>
              {uploadFile && (
                <p className="mt-2 text-sm font-medium text-gray-800">
                  Selected: {uploadFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSimulateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitSimulation} 
              disabled={!uploadFile || runningScheme}
            >
              {runningScheme ? 'Running Simulation...' : 'Run Simulation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Execution Logs Modal */}
      <Dialog open={logsModalOpen} onOpenChange={setLogsModalOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Execution Logs - {selectedScheme?.name}</DialogTitle>
            <DialogDescription>
              View all previous execution runs for this scheme.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="logs" className="w-full">
            <TabsList>
              <TabsTrigger value="logs">Execution Logs</TabsTrigger>
              {selectedLog && <TabsTrigger value="details">Log Details</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="logs">
              <div className="mt-4">
                {executionLogs.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    No execution logs found for this scheme.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Run ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Agents</TableHead>
                        <TableHead>Passed</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Total Commission</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {executionLogs.map((log) => (
                        <TableRow key={log.runId}>
                          <TableCell className="font-mono text-xs">{log.runId}</TableCell>
                          <TableCell>
                            <Badge variant={log.mode === 'simulation' ? 'secondary' : 'destructive'}>
                              {log.mode === 'simulation' ? 'Simulation' : 'Production'}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(log.executedAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                          <TableCell>{log.summary.totalAgents}</TableCell>
                          <TableCell className="text-green-600">{log.summary.passed}</TableCell>
                          <TableCell className="text-red-600">{log.summary.failed}</TableCell>
                          <TableCell>${log.summary.totalCommission.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewLogDetails(log)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="details">
              {selectedLog && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Run Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Run Type</p>
                        <p className="font-medium">
                          {selectedLog.mode === 'simulation' ? 'Simulation' : 'Production'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Agents</p>
                        <p className="font-medium">{selectedLog.summary.totalAgents}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Qualified</p>
                        <p className="font-medium text-green-600">{selectedLog.summary.passed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Not Qualified</p>
                        <p className="font-medium text-red-600">{selectedLog.summary.failed}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Total Commission</p>
                        <p className="font-medium">${selectedLog.summary.totalCommission.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-lg mb-2">Agent Results</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Agent ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Total Sales</TableHead>
                          <TableHead className="text-right">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedLog.agents.map((agent) => (
                          <TableRow key={agent.agentId}>
                            <TableCell className="font-mono text-xs">{agent.agentId}</TableCell>
                            <TableCell>
                              <Badge variant={agent.qualified ? 'success' : 'destructive'} className={agent.qualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {agent.qualified ? 'Qualified' : 'Not Qualified'}
                              </Badge>
                            </TableCell>
                            <TableCell>${agent.commission.toLocaleString()}</TableCell>
                            <TableCell>{agent.totalSales ? `$${agent.totalSales.toLocaleString()}` : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">View Detail</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl">
                                  <DialogHeader>
                                    <DialogTitle>Agent {agent.agentId} Detail</DialogTitle>
                                  </DialogHeader>
                                  <Tabs defaultValue="qualifying">
                                    <TabsList>
                                      <TabsTrigger value="qualifying">Qualifying Criteria</TabsTrigger>
                                      <TabsTrigger value="exclusions">Exclusions</TabsTrigger>
                                      <TabsTrigger value="adjustments">Adjustments</TabsTrigger>
                                      <TabsTrigger value="custom">Custom Logic</TabsTrigger>
                                    </TabsList>
                                    
                                    <TabsContent value="qualifying">
                                      <div className="mt-4">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Rule</TableHead>
                                              <TableHead>Result</TableHead>
                                              <TableHead>Details</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {agent.qualifyingCriteria.map((criteria, idx) => (
                                              <TableRow key={idx}>
                                                <TableCell>{criteria.rule}</TableCell>
                                                <TableCell>
                                                  <Badge variant={criteria.result ? 'success' : 'destructive'} className={criteria.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {criteria.result ? 'Passed' : 'Failed'}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>
                                                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                                    {JSON.stringify(criteria.data, null, 2)}
                                                  </pre>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="exclusions">
                                      <div className="mt-4">
                                        {agent.exclusions.length === 0 ? (
                                          <p className="text-gray-500 py-4">No exclusions applied.</p>
                                        ) : (
                                          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                                            {JSON.stringify(agent.exclusions, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="adjustments">
                                      <div className="mt-4">
                                        {agent.adjustments.length === 0 ? (
                                          <p className="text-gray-500 py-4">No adjustments applied.</p>
                                        ) : (
                                          <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
                                            {JSON.stringify(agent.adjustments, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    </TabsContent>
                                    
                                    <TabsContent value="custom">
                                      <div className="mt-4">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead>Rule</TableHead>
                                              <TableHead>Result</TableHead>
                                              <TableHead>Notes</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {agent.customLogic.map((logic, idx) => (
                                              <TableRow key={idx}>
                                                <TableCell>{logic.rule}</TableCell>
                                                <TableCell>
                                                  <Badge variant={logic.result ? 'success' : 'destructive'} className={logic.result ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                                    {logic.result ? 'Passed' : 'Failed'}
                                                  </Badge>
                                                </TableCell>
                                                <TableCell>{logic.notes}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </TabsContent>
                                  </Tabs>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
