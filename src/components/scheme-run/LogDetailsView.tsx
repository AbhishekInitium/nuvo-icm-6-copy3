
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExecutionLog } from '@/types/scheme-run';

interface LogDetailsViewProps {
  selectedLog: ExecutionLog;
}

export function LogDetailsView({ selectedLog }: LogDetailsViewProps) {
  return (
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
  );
}
