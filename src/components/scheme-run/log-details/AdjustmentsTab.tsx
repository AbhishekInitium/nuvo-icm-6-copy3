
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentResult } from '@/types/scheme-run';

interface AdjustmentsTabProps {
  agent: AgentResult;
}

export function AdjustmentsTab({ agent }: AdjustmentsTabProps) {
  if (!agent.adjustments || agent.adjustments.length === 0) {
    return <p className="text-gray-500 py-4">No adjustments applied.</p>;
  }

  return (
    <div className="mt-4">
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
    </div>
  );
}
