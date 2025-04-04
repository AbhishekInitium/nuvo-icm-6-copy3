
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentResult } from '@/types/scheme-run';

interface ExclusionsTabProps {
  agent: AgentResult;
}

export function ExclusionsTab({ agent }: ExclusionsTabProps) {
  if (!agent.exclusions || agent.exclusions.length === 0) {
    return <p className="text-gray-500 py-4">No exclusions applied.</p>;
  }

  return (
    <div className="mt-4">
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
    </div>
  );
}
