
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ExecutionLog } from '@/types/scheme-run';
import { FileDown, Copy } from 'lucide-react';

interface LogDetailsViewProps {
  selectedLog: ExecutionLog;
  onDownloadJson: (log: ExecutionLog) => void;
  onCopyLog: (log: ExecutionLog) => void;
}

export function LogDetailsView({ 
  selectedLog,
  onDownloadJson,
  onCopyLog
}: LogDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Run Details: {selectedLog.runId}</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDownloadJson(selectedLog)}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCopyLog(selectedLog)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Log
          </Button>
        </div>
      </div>

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
        <Accordion type="single" collapsible className="w-full">
          {selectedLog.agents.map((agent, index) => (
            <AccordionItem key={agent.agentId} value={agent.agentId}>
              <AccordionTrigger className="py-4 px-4 bg-gray-50 hover:bg-gray-100 rounded-t">
                <div className="flex items-center gap-4 w-full">
                  <div className="font-medium">Agent {agent.agentId}</div>
                  <Badge variant={agent.qualified ? "success" : "destructive"} className={agent.qualified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {agent.qualified ? 'Qualified' : 'Not Qualified'}
                  </Badge>
                  <div className="ml-auto text-sm">Commission: ${agent.commission.toLocaleString()}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="bg-white p-4 border border-t-0 rounded-b">
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
                      {agent.exclusions && agent.exclusions.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Exclusion</TableHead>
                              <TableHead>Applied</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {agent.exclusions.map((exclusion, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{exclusion.rule || `Exclusion ${idx + 1}`}</TableCell>
                                <TableCell>
                                  <Badge variant={exclusion.applied ? 'destructive' : 'outline'}>
                                    {exclusion.applied ? 'Applied' : 'Not Applied'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                    {JSON.stringify(exclusion, null, 2)}
                                  </pre>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-500 py-4">No exclusions applied.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="adjustments">
                    <div className="mt-4">
                      {agent.adjustments && agent.adjustments.length ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Adjustment Factor</TableHead>
                              <TableHead>Before</TableHead>
                              <TableHead>After</TableHead>
                              <TableHead>Details</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {agent.adjustments.map((adjustment, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{adjustment.name || `Adjustment ${idx + 1}`}</TableCell>
                                <TableCell>{adjustment.before !== undefined ? adjustment.before : 'N/A'}</TableCell>
                                <TableCell>{adjustment.after !== undefined ? adjustment.after : 'N/A'}</TableCell>
                                <TableCell>
                                  <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                    {JSON.stringify(adjustment, null, 2)}
                                  </pre>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <p className="text-gray-500 py-4">No adjustments applied.</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="custom">
                    <div className="mt-4">
                      {agent.customLogic && agent.customLogic.length ? (
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
                      ) : (
                        <p className="text-gray-500 py-4">No custom logic applied.</p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
