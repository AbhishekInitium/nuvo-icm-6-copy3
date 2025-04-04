
import { ExecutionLog, AgentResult } from '@/types/scheme-run';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCaption, TableCell, 
  TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface RunDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  run: ExecutionLog;
}

export function RunDetailsModal({ isOpen, onClose, run }: RunDetailsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Run Details
            <Badge variant={run.mode === 'production' ? 'default' : 'secondary'}>
              {run.mode === 'production' ? 'Production' : 'Simulation'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Run ID: {run.runId} | Scheme ID: {run.schemeId}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Execution Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{format(new Date(run.executedAt), 'PPP pp')}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{run.summary.totalAgents}</span>
                <div className="text-sm">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
                    <span>{run.summary.passed} qualified</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                    <span>{run.summary.failed} not qualified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Financial Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center py-4">
              ${run.summary.totalCommission.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Total Commission Payout
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-4" />
        
        <h3 className="text-lg font-semibold">Agent Results</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>List of agents and their commission amounts.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Agent ID</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Total Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {run.agents?.map((agent) => (
                <TableRow key={agent.agentId}>
                  <TableCell className="font-medium">{agent.agentId}</TableCell>
                  <TableCell>
                    {agent.qualified ? 
                      <Badge variant="success">Qualified</Badge> : 
                      <Badge variant="destructive">Not Qualified</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    ${agent.commission.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </TableCell>
                  <TableCell>
                    {agent.totalSales ? 
                      `$${agent.totalSales.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}` : 
                      'N/A'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
