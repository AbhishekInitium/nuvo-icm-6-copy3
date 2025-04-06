
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentResult } from '@/types/scheme-run';

interface CustomLogicTabProps {
  agent: AgentResult;
}

export function CustomLogicTab({ agent }: CustomLogicTabProps) {
  if (!agent.customLogic || agent.customLogic.length === 0) {
    return <p className="text-gray-500 py-4">No custom logic applied.</p>;
  }

  return (
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
                <Badge variant={logic.result ? 'success' : 'destructive'}>
                  {logic.result ? 'Passed' : 'Failed'}
                </Badge>
              </TableCell>
              <TableCell>{logic.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
