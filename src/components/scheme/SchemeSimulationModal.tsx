
import React, { useState } from 'react';
import { UploadCloud, FileJson, FileX, Download, Check, X, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/api/client';

interface SchemeSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  schemeData: any;
  onSuccess: () => void;
}

interface SimulationResult {
  runId: string;
  agents: Array<{
    agentId: string;
    totalSales: number;
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
    baseData: {
      region: string;
      productLine: string;
      salesType: string;
    };
  }>;
  summary: {
    totalAgents: number;
    passed: number;
    failed: number;
    totalCommission: number;
  };
}

export function SchemeSimulationModal({ isOpen, onClose, schemeData, onSuccess }: SchemeSimulationModalProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'simulating' | 'success' | 'error'>('idle');
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [expandedAgents, setExpandedAgents] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus('uploading');
    setUploadError(null);

    // Mock file upload parsing
    setTimeout(() => {
      // Check if it's a valid file type
      if (file.type !== 'application/json' && !file.name.endsWith('.xlsx')) {
        setUploadStatus('error');
        setUploadError('Invalid file type. Please upload JSON or Excel file.');
        return;
      }

      setUploadStatus('success');
    }, 1000);
  };

  const runSimulation = async () => {
    setSimulationStatus('simulating');
    setSimulationError(null);

    try {
      // Call the API to simulate
      const response = await apiClient.post('/execute/run', {
        schemeId: 'TEMP_SIMULATION', // Temporary ID for simulation
        clientId: 'client_XYZ', // Mock client ID
        mode: 'simulation',
        schemeData // The current scheme data
      });

      setSimulationResult(response.data.data);
      setSimulationStatus('success');
    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationStatus('error');
      setSimulationError('Failed to run simulation. Please try again.');
    }
  };

  const toggleAgentExpansion = (agentId: string) => {
    if (expandedAgents.includes(agentId)) {
      setExpandedAgents(expandedAgents.filter(id => id !== agentId));
    } else {
      setExpandedAgents([...expandedAgents, agentId]);
    }
  };

  const downloadResults = () => {
    if (!simulationResult) return;

    const dataStr = JSON.stringify(simulationResult, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `scheme_simulation_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulate Scheme Performance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {simulationStatus !== 'success' && (
            <div className="border rounded-md p-6 space-y-4">
              <h3 className="text-lg font-medium">Upload Test Data</h3>
              
              {uploadStatus === 'error' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}
              
              <div className="flex items-center justify-center w-full">
                <label 
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                >
                  {uploadStatus === 'uploading' ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Loader2 className="w-8 h-8 mb-3 text-primary animate-spin" />
                      <p className="mb-2 text-sm text-muted-foreground">Uploading file...</p>
                    </div>
                  ) : uploadStatus === 'success' ? (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileJson className="w-8 h-8 mb-3 text-primary" />
                      <p className="mb-2 text-sm text-muted-foreground">File uploaded successfully</p>
                      <p className="text-xs text-muted-foreground">Click to upload a different file</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <UploadCloud className="w-8 h-8 mb-3 text-primary" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">JSON or Excel file with test data</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".json,.xlsx" 
                    onChange={handleFileUpload}
                    disabled={simulationStatus === 'simulating'}
                  />
                </label>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                Upload a file with sample transaction data to simulate how your scheme will perform.
              </p>

              <div className="flex justify-end">
                <Button 
                  onClick={runSimulation} 
                  disabled={uploadStatus !== 'success' || simulationStatus === 'simulating'}
                >
                  {simulationStatus === 'simulating' && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Run Simulation
                </Button>
              </div>
            </div>
          )}

          {simulationStatus === 'error' && (
            <Alert variant="destructive">
              <AlertDescription>{simulationError}</AlertDescription>
            </Alert>
          )}

          {simulationStatus === 'success' && simulationResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-muted rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Agents</p>
                      <p className="text-2xl font-bold">{simulationResult.summary.totalAgents}</p>
                    </div>
                    <div className="bg-muted rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">Qualified</p>
                      <p className="text-2xl font-bold text-green-600">{simulationResult.summary.passed}</p>
                    </div>
                    <div className="bg-muted rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">Failed</p>
                      <p className="text-2xl font-bold text-red-500">{simulationResult.summary.failed}</p>
                    </div>
                    <div className="bg-muted rounded-md p-4 text-center">
                      <p className="text-sm text-muted-foreground">Total Commission</p>
                      <p className="text-2xl font-bold">${simulationResult.summary.totalCommission.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Agent Results</h3>
                    
                    {simulationResult.agents.map((agent) => (
                      <Card key={agent.agentId} className={`overflow-hidden ${agent.qualified ? 'border-green-300' : 'border-red-300'}`}>
                        <CardContent className="p-0">
                          <div 
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => toggleAgentExpansion(agent.agentId)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedAgents.includes(agent.agentId) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                              <span className="font-medium">{agent.agentId}</span>
                              <Badge variant={agent.qualified ? "success" : "destructive"}>
                                {agent.qualified ? 'Qualified' : 'Not Qualified'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm">
                                <span className="text-muted-foreground mr-1">Sales:</span>
                                <span className="font-medium">${agent.totalSales.toLocaleString()}</span>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground mr-1">Commission:</span>
                                <span className="font-medium">${agent.commission.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <Collapsible open={expandedAgents.includes(agent.agentId)}>
                            <CollapsibleContent>
                              <div className="border-t p-4 space-y-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Base Data</h4>
                                  <div className="bg-muted rounded-md p-3 text-sm grid grid-cols-3 gap-2">
                                    <div>
                                      <span className="text-muted-foreground">Region: </span>
                                      <span>{agent.baseData.region}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Product Line: </span>
                                      <span>{agent.baseData.productLine}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Sales Type: </span>
                                      <span>{agent.baseData.salesType}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium mb-2">Qualifying Criteria</h4>
                                  <div className="bg-muted rounded-md p-3 text-sm space-y-2">
                                    {agent.qualifyingCriteria.map((criteria, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        {criteria.result ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <X className="h-4 w-4 text-red-500" />
                                        )}
                                        <span className="text-muted-foreground">{criteria.rule}: </span>
                                        <span>
                                          {criteria.data ? JSON.stringify(criteria.data) : 'No data'}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {agent.exclusions.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Exclusions</h4>
                                    <div className="bg-muted rounded-md p-3 text-sm">
                                      {agent.exclusions.map((exclusion, index) => (
                                        <div key={index} className="mb-1">
                                          {JSON.stringify(exclusion)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {agent.adjustments.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Adjustments</h4>
                                    <div className="bg-muted rounded-md p-3 text-sm">
                                      {agent.adjustments.map((adjustment, index) => (
                                        <div key={index} className="mb-1">
                                          {JSON.stringify(adjustment)}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {agent.customLogic.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">Custom Rules</h4>
                                    <div className="bg-muted rounded-md p-3 text-sm space-y-2">
                                      {agent.customLogic.map((logic, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          {logic.result ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                          ) : (
                                            <X className="h-4 w-4 text-red-500" />
                                          )}
                                          <span className="text-muted-foreground">{logic.rule}: </span>
                                          <span>{logic.notes}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          {simulationStatus === 'success' && (
            <Button variant="outline" onClick={downloadResults}>
              <Download className="mr-2 h-4 w-4" />
              Download Results
            </Button>
          )}
          <div className="flex gap-2">
            {simulationStatus === 'success' ? (
              <>
                <Button variant="outline" onClick={onClose}>
                  Edit Scheme
                </Button>
                <Button onClick={onSuccess}>
                  Create Scheme
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
