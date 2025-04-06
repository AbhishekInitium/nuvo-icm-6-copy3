
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AgentResult } from '@/types/scheme-run';

interface QualifyingCriteriaTabProps {
  agent: AgentResult;
}

export function QualifyingCriteriaTab({ agent }: QualifyingCriteriaTabProps) {
  return (
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
                <Badge variant={criteria.result ? 'success' : 'destructive'}>
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
  );
}
