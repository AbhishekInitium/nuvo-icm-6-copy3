
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExecutionLog } from '@/types/scheme-run';

interface ExecutionLogListProps {
  executionLogs: ExecutionLog[];
  onViewDetails: (log: ExecutionLog) => void;
}

export function ExecutionLogList({ executionLogs, onViewDetails }: ExecutionLogListProps) {
  if (executionLogs.length === 0) {
    return (
      <p className="text-center py-8 text-gray-500">
        No execution logs found for this scheme.
      </p>
    );
  }

  return (
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
                onClick={() => onViewDetails(log)}
              >
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
